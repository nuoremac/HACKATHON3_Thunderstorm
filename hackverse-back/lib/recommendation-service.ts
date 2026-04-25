import {
  getStudentById,
  listAssociations,
  listDataSources,
  listEvents,
  listFeedback,
  listHelpRequests,
  listImpactRecords,
  listSignals,
  listStudents,
  listTimetableSlots,
  replaceRecommendations
} from "@/lib/db";
import { classifyCandidateContext } from "@/lib/data-trust";
import { featureFlags } from "@/lib/feature-flags";
import { logStructuredError } from "@/lib/observability";
import {
  aggregateGlobalConfidence,
  applyFallbackRecommendationMode,
  buildRecommendation
} from "@/lib/scoring-engine";
import type {
  Association,
  CandidateContext,
  Event,
  HelpRequest,
  RecommendationOutput,
  RecommendationType,
  Student
} from "@/lib/types";

function isActiveSignal(expiresAt?: string | null) {
  return !expiresAt || new Date(expiresAt) > new Date();
}

function isNewStudentMode(student: Student) {
  if (student.profile_completeness < 0.5) return true;
  if (!student.created_at) return false;
  const ageDays = (Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24);
  return ageDays <= 14;
}

function mixForNewStudentMode(recommendations: RecommendationOutput[]) {
  const buckets = new Map<RecommendationType, RecommendationOutput[]>();
  recommendations.forEach((item) => {
    const bucket = buckets.get(item.targetType) ?? [];
    bucket.push(item);
    buckets.set(item.targetType, bucket);
  });

  const orderedTypes: RecommendationType[] = ["event", "association", "student", "help_opportunity"];
  const frontloaded: RecommendationOutput[] = [];

  orderedTypes.forEach((type) => {
    const bucket = buckets.get(type);
    if (bucket?.length) {
      frontloaded.push(bucket.shift() as RecommendationOutput);
    }
  });

  const remainder = orderedTypes.flatMap((type) => buckets.get(type) ?? []);
  return [...frontloaded, ...remainder];
}

function buildContext<T extends Student | Association | Event | HelpRequest>(
  student: Student,
  targetType: RecommendationType,
  target: T,
  bag: {
    feedback: Awaited<ReturnType<typeof listFeedback>>;
    impactRecords: Awaited<ReturnType<typeof listImpactRecords>>;
    signals: Awaited<ReturnType<typeof listSignals>>;
    timetableSlots: Awaited<ReturnType<typeof listTimetableSlots>>;
    dataSources: Awaited<ReturnType<typeof listDataSources>>;
  }
): CandidateContext {
  const context = {
    student,
    targetType,
    target,
    feedback: bag.feedback,
    impactRecords: bag.impactRecords,
    relevantSignals: bag.signals.filter(
      (signal) => signal.student_id === student.id && isActiveSignal(signal.expires_at)
    ),
    timetableSlots: bag.timetableSlots.filter((slot) => slot.student_id === student.id),
    sources: bag.dataSources.filter(
      (source) => source.entity_id === (target as { id: string }).id && source.entity_type === targetType
    )
  };

  return {
    ...context,
    trustMetadata: classifyCandidateContext(context)
  };
}

async function safeLoad<T>(label: string, loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    logStructuredError("recommendation_service_loader", error, { label });
    return fallback;
  }
}

export async function generateRecommendations(studentId: string) {
  try {
    const student = await getStudentById(studentId);
    if (!student) {
      return null;
    }

    const [students, associations, events, helpRequests, feedback, impactRecords, signals, timetableSlots, dataSources] =
      await Promise.all([
        safeLoad("students", () => listStudents(), []),
        safeLoad("associations", () => listAssociations(), []),
        safeLoad("events", () => listEvents(), []),
        safeLoad("help_requests", () => listHelpRequests(), []),
        safeLoad("feedback", () => listFeedback(), []),
        safeLoad("impact_records", () => listImpactRecords(), []),
        safeLoad("signals", () => listSignals(), []),
        safeLoad("timetable_slots", () => listTimetableSlots(), []),
        safeLoad("data_sources", () => listDataSources(), [])
      ]);

    const outputs: RecommendationOutput[] = [];
    const sharedBag = {
      feedback,
      impactRecords,
      signals,
      timetableSlots,
      dataSources
    };

    students
      .filter((candidate) => candidate.id !== student.id)
      .forEach((candidate) => {
        outputs.push(buildRecommendation(buildContext(student, "student", candidate, sharedBag)));
      });

    associations.forEach((candidate) => {
      outputs.push(buildRecommendation(buildContext(student, "association", candidate, sharedBag)));
    });

    events.forEach((candidate) => {
      outputs.push(buildRecommendation(buildContext(student, "event", candidate, sharedBag)));
    });

    helpRequests
      .filter((candidate) => candidate.status === "open" && candidate.requester_id !== student.id)
      .forEach((candidate) => {
        outputs.push(
          buildRecommendation(buildContext(student, "help_opportunity", candidate, sharedBag))
        );
      });

    const ranked = outputs.sort((left, right) => {
      if (right.score === left.score) return right.confidence - left.confidence;
      return right.score - left.score;
    });

    const confidenceBeforeFallback = aggregateGlobalConfidence(ranked);
    const shouldUseFallback =
      featureFlags.enableFallbackMode &&
      confidenceBeforeFallback < featureFlags.fallbackConfidenceThreshold;

    const fallbackAdjusted = shouldUseFallback
      ? applyFallbackRecommendationMode(ranked)
      : ranked;
    const remixed = isNewStudentMode(student)
      ? mixForNewStudentMode(fallbackAdjusted)
      : fallbackAdjusted;
    const finalRanked = remixed.map((item) => ({
      ...item,
      diagnostics: {
        ...(item.diagnostics ?? { fallback_used: false }),
        fallback_used: shouldUseFallback || item.diagnostics?.fallback_used === true,
        global_confidence: confidenceBeforeFallback
      }
    }));

    try {
      const storedRecommendations = await replaceRecommendations(
        studentId,
        finalRanked.map((item) => ({
          student_id: studentId,
          target_type: item.targetType,
          target_id: item.targetId,
          score: item.score,
          confidence: item.confidence,
          explanation: item.explanation
        })),
        finalRanked.map((item) =>
          item.assumptions.map((assumption) => ({
            assumption: assumption.assumption,
            source: assumption.source,
            confidence: assumption.confidence,
            risk_level: assumption.risk_level,
            is_user_confirmed: assumption.is_user_confirmed
          }))
        )
      );

      finalRanked.forEach((item, index) => {
        const recommendationId = storedRecommendations[index]?.id;
        item.assumptions = item.assumptions.map((assumption) => ({
          ...assumption,
          linked_recommendation_id: recommendationId
        }));
      });
    } catch (error) {
      logStructuredError("recommendation_persistence", error, { studentId });
      finalRanked.forEach((item) => {
        item.diagnostics = {
          ...(item.diagnostics ?? { fallback_used: false }),
          error: {
            success: false,
            error_code: "RECOMMENDATION_PERSISTENCE_FAILED",
            message: "Recommendations were generated but could not be persisted.",
            fallback_used: true
          }
        };
      });
    }

    return {
      student,
      generated_at: new Date().toISOString(),
      recommendations: finalRanked,
      diagnostics: {
        fallback_used: shouldUseFallback,
        global_confidence: confidenceBeforeFallback
      }
    };
  } catch (error) {
    logStructuredError("recommendation_service", error, { studentId });
    const student = await safeLoad("student_lookup_fallback", () => getStudentById(studentId), null);
    if (!student) {
      return null;
    }

    return {
      student,
      generated_at: new Date().toISOString(),
      recommendations: [],
      diagnostics: {
        fallback_used: true,
        global_confidence: 0,
        error: {
          success: false,
          error_code: "RECOMMENDATION_SERVICE_FAILED",
          message: "Recommendations fell back to an empty safe response.",
          fallback_used: true
        }
      }
    };
  }
}
