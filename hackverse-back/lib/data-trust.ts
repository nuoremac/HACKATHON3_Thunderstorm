import { featureFlags } from "@/lib/feature-flags";
import { clamp } from "@/lib/http";
import { logStructuredError } from "@/lib/observability";
import type {
  Association,
  CandidateContext,
  Event,
  HelpRequest,
  RecommendationTrustMetadata,
  Student,
  TrustAnnotatedDatum,
  TrustMetrics,
  TrustSummary
} from "@/lib/types";

const LEVELS = ["VALIDATED", "UNCERTAIN", "CONTRADICTORY", "INFERRED", "MISSING"] as const;

function normalizeValue(value: unknown) {
  if (value == null) return "";
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).trim().toLowerCase();
}

function isMissingValue(value: unknown) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function sourceLooksValidated(sourceType?: string) {
  if (!sourceType) return false;
  const normalized = sourceType.toLowerCase();
  return (
    normalized.includes("official") ||
    normalized.includes("admin") ||
    normalized.includes("verified") ||
    normalized.includes("timetable")
  );
}

function sourceLooksInferred(sourceType?: string) {
  if (!sourceType) return false;
  const normalized = sourceType.toLowerCase();
  return normalized.includes("inferred") || normalized.includes("system") || normalized.includes("derived");
}

export class DataTrustClassifier {
  static classifyDatum<T>(params: {
    key: string;
    value: T;
    sourceType?: string;
    inferred?: boolean;
    alternatives?: unknown[];
    explicitValidated?: boolean;
    metadata?: Record<string, unknown>;
  }): TrustAnnotatedDatum<T> {
    try {
      if (!featureFlags.enableDataTrustLayer) {
        return {
          key: params.key,
          value: params.value,
          trustLevel: "UNCERTAIN",
          conflict_flag: false,
          metadata: params.metadata ?? {}
        };
      }

      const alternatives = params.alternatives ?? [];
      const normalized = [params.value, ...alternatives].map(normalizeValue).filter(Boolean);
      const uniqueValues = [...new Set(normalized)];
      const hasConflict = uniqueValues.length > 1;

      let trustLevel: TrustAnnotatedDatum<T>["trustLevel"] = "UNCERTAIN";
      if (isMissingValue(params.value)) {
        trustLevel = "MISSING";
      } else if (hasConflict) {
        trustLevel = "CONTRADICTORY";
      } else if (params.inferred || sourceLooksInferred(params.sourceType)) {
        trustLevel = "INFERRED";
      } else if (params.explicitValidated || sourceLooksValidated(params.sourceType)) {
        trustLevel = "VALIDATED";
      }

      return {
        key: params.key,
        value: params.value,
        trustLevel,
        conflict_flag: hasConflict,
        metadata: {
          ...(params.metadata ?? {}),
          alternatives,
          values: uniqueValues
        }
      };
    } catch (error) {
      logStructuredError("data_trust_classifier", error, { key: params.key });
      return {
        key: params.key,
        value: params.value,
        trustLevel: "UNCERTAIN",
        conflict_flag: false,
        metadata: params.metadata ?? {}
      };
    }
  }
}

export function resolveConflict<T>(params: {
  key: string;
  primary: T;
  secondary: T;
  primaryReliability: number;
  secondaryReliability: number;
}) {
  try {
    if (!featureFlags.enableConflictResolution) {
      return {
        resolvedValue: params.primary,
        trustLevel: "UNCERTAIN" as const,
        conflict_flag: false,
        confidencePenalty: 0,
        metadata: {
          values: [params.primary, params.secondary]
        }
      };
    }

    const primaryReliability = clamp(params.primaryReliability, 0, 1);
    const secondaryReliability = clamp(params.secondaryReliability, 0, 1);

    if (primaryReliability > secondaryReliability) {
      return {
        resolvedValue: params.primary,
        trustLevel: "CONTRADICTORY" as const,
        conflict_flag: true,
        confidencePenalty: 0.05,
        metadata: {
          selected: "primary",
          values: [params.primary, params.secondary],
          reliabilities: [primaryReliability, secondaryReliability]
        }
      };
    }

    if (secondaryReliability > primaryReliability) {
      return {
        resolvedValue: params.secondary,
        trustLevel: "CONTRADICTORY" as const,
        conflict_flag: true,
        confidencePenalty: 0.05,
        metadata: {
          selected: "secondary",
          values: [params.primary, params.secondary],
          reliabilities: [primaryReliability, secondaryReliability]
        }
      };
    }

    const mergedValue =
      typeof params.primary === "number" && typeof params.secondary === "number"
        ? ({
            min: Math.min(params.primary, params.secondary),
            max: Math.max(params.primary, params.secondary)
          } as T)
        : ([params.primary, params.secondary] as T);

    return {
      resolvedValue: mergedValue,
      trustLevel: "CONTRADICTORY" as const,
      conflict_flag: true,
      confidencePenalty: 0.08,
      metadata: {
        selected: "ambiguous",
        values: [params.primary, params.secondary],
        reliabilities: [primaryReliability, secondaryReliability]
      }
    };
  } catch (error) {
    logStructuredError("conflict_resolution", error, { key: params.key });
    return {
      resolvedValue: params.primary,
      trustLevel: "UNCERTAIN" as const,
      conflict_flag: false,
      confidencePenalty: 0,
      metadata: {
        values: [params.primary, params.secondary]
      }
    };
  }
}

function summarizeAnnotations(annotations: TrustAnnotatedDatum<unknown>[]): TrustSummary {
  const counts = {
    VALIDATED: 0,
    UNCERTAIN: 0,
    CONTRADICTORY: 0,
    INFERRED: 0,
    MISSING: 0
  };

  annotations.forEach((annotation) => {
    counts[annotation.trustLevel] += 1;
  });

  const total = Math.max(annotations.length, 1);
  return {
    annotations,
    counts,
    ratios: {
      validated_ratio: counts.VALIDATED / total,
      uncertain_ratio: counts.UNCERTAIN / total,
      contradictory_ratio: counts.CONTRADICTORY / total,
      inferred_ratio: counts.INFERRED / total,
      missing_ratio: counts.MISSING / total
    },
    conflict_flag: annotations.some((annotation) => annotation.conflict_flag)
  };
}

export function classifyCandidateContext(context: CandidateContext): RecommendationTrustMetadata {
  try {
    const annotations: TrustAnnotatedDatum<unknown>[] = [];
    const { student, target, targetType, sources, relevantSignals, timetableSlots } = context;

    annotations.push(
      DataTrustClassifier.classifyDatum({
        key: "student.department",
        value: student.department,
        sourceType: "student_profile"
      }),
      DataTrustClassifier.classifyDatum({
        key: "student.academic_year",
        value: student.academic_year,
        sourceType: "student_profile"
      }),
      DataTrustClassifier.classifyDatum({
        key: "student.interests",
        value: student.interests,
        sourceType: relevantSignals.some((signal) => signal.signal_type === "interest_inferred")
          ? "inferred_interest"
          : "student_profile",
        inferred: relevantSignals.some((signal) => signal.signal_type === "interest_inferred")
      }),
      DataTrustClassifier.classifyDatum({
        key: "student.skills",
        value: [...student.skills_offered, ...student.skills_needed],
        sourceType: "student_profile"
      }),
      DataTrustClassifier.classifyDatum({
        key: "student.availability",
        value: student.availability,
        sourceType: timetableSlots.length ? "timetable" : "student_profile",
        alternatives: timetableSlots.map((slot) => ({
          start_time: slot.start_time,
          end_time: slot.end_time,
          location: slot.location
        }))
      }),
      DataTrustClassifier.classifyDatum({
        key: "target.source",
        value: targetType === "event" ? (target as Event).source : targetType,
        sourceType: targetType === "event" ? (target as Event).source : "system"
      }),
      DataTrustClassifier.classifyDatum({
        key: "sources.reliability",
        value: sources.map((source) => source.reliability_score),
        sourceType: sources.some((source) => sourceLooksValidated(source.source_type))
          ? "official_source"
          : "uncertain_source"
      })
    );

    if (targetType === "event") {
      const event = target as Event;
      annotations.push(
        DataTrustClassifier.classifyDatum({
          key: "event.verification_status",
          value: event.verification_status,
          sourceType: event.verification_status === "verified" ? "verified_event" : "event_source",
          explicitValidated: event.verification_status === "verified"
        }),
        DataTrustClassifier.classifyDatum({
          key: "event.schedule",
          value: {
            start_time: event.start_time,
            end_time: event.end_time
          },
          sourceType: event.source
        })
      );
    }

    return summarizeAnnotations(annotations);
  } catch (error) {
    logStructuredError("candidate_context_trust", error);
    return summarizeAnnotations([]);
  }
}

export function buildQualityMetrics(params: {
  students: Student[];
  associations: Association[];
  events: Event[];
  helpRequests: HelpRequest[];
}) {
  try {
    const annotations: TrustAnnotatedDatum<unknown>[] = [];

    params.students.forEach((student) => {
      annotations.push(
        DataTrustClassifier.classifyDatum({
          key: `student:${student.id}:interests`,
          value: student.interests,
          sourceType: "student_profile"
        }),
        DataTrustClassifier.classifyDatum({
          key: `student:${student.id}:availability`,
          value: student.availability,
          sourceType: "student_profile"
        })
      );
    });

    params.associations.forEach((association) => {
      annotations.push(
        DataTrustClassifier.classifyDatum({
          key: `association:${association.id}:description`,
          value: association.description,
          sourceType: "association_profile"
        })
      );
    });

    params.events.forEach((event) => {
      annotations.push(
        DataTrustClassifier.classifyDatum({
          key: `event:${event.id}:verification`,
          value: event.verification_status,
          sourceType: event.source,
          explicitValidated: event.verification_status === "verified"
        }),
        DataTrustClassifier.classifyDatum({
          key: `event:${event.id}:location`,
          value: event.location,
          sourceType: event.source
        })
      );
    });

    params.helpRequests.forEach((request) => {
      annotations.push(
        DataTrustClassifier.classifyDatum({
          key: `help_request:${request.id}:helper`,
          value: request.helper_id,
          sourceType: request.status === "completed" ? "validated_help_request" : "help_request"
        })
      );
    });

    return summarizeAnnotations(annotations).ratios satisfies TrustMetrics;
  } catch (error) {
    logStructuredError("data_quality_metrics", error);
    return {
      validated_ratio: 0,
      uncertain_ratio: 1,
      contradictory_ratio: 0,
      inferred_ratio: 0,
      missing_ratio: 0
    } satisfies TrustMetrics;
  }
}
