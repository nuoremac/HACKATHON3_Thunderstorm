import { clamp } from "@/lib/http";
import { logStructuredError } from "@/lib/observability";
import type {
  CandidateContext,
  RecommendationAssumptionInput,
  RiskLevel,
  Student
} from "@/lib/types";

function pushAssumption(
  assumptions: RecommendationAssumptionInput[],
  assumption: string,
  source: string,
  confidence: number,
  risk_level: RiskLevel,
  confidence_impact: number,
  impact_on_score: number,
  risk_if_wrong: RiskLevel,
  confidence_delta: number,
  is_user_confirmed = false
) {
  assumptions.push({
    assumption,
    source,
    confidence: clamp(confidence),
    risk_level,
    confidence_impact,
    impact_on_score,
    risk_if_wrong,
    confidence_delta,
    is_user_confirmed
  });
}

function decayedConfidence(baseConfidence: number, observedAt?: string) {
  if (!observedAt) return clamp(baseConfidence);
  const ageDays = Math.max(
    0,
    (Date.now() - new Date(observedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const decayFactor = Math.max(0.65, 1 - ageDays / 180);
  return clamp(baseConfidence * decayFactor);
}

export function buildAssumptions(context: CandidateContext): RecommendationAssumptionInput[] {
  try {
    const assumptions: RecommendationAssumptionInput[] = [];
    const { student, target, targetType, relevantSignals, timetableSlots, sources } = context;
    const newestSignalAt = relevantSignals
      .map((signal) => signal.created_at)
      .filter(Boolean)
      .sort()
      .at(-1);
    const newestSourceAt = sources
      .map((source) => source.last_updated)
      .filter(Boolean)
      .sort()
      .at(-1);

    if (!student.interests.length && targetType !== "help_opportunity") {
      pushAssumption(
        assumptions,
        "Missing interests were bridged from department-level and signal-level patterns.",
        "system_inference",
        decayedConfidence(0.45, newestSignalAt ?? student.created_at),
        "high",
        -0.08,
        0.08,
        "high",
        -0.08
      );
    }

    if (!student.availability.length && !timetableSlots.length) {
      pushAssumption(
        assumptions,
        "Availability was estimated from sparse profile data because no explicit schedule was provided.",
        "missing_profile_data",
        decayedConfidence(0.35, student.created_at),
        "high",
        -0.1,
        0.1,
        "high",
        -0.1
      );
    }

    if (targetType === "association") {
      pushAssumption(
        assumptions,
        "Association relevance was inferred from overlaps between student interests, tags, and recruitment needs.",
        "association_tags",
        decayedConfidence(0.72, newestSourceAt),
        "medium",
        -0.03,
        0.06,
        "medium",
        -0.03
      );
    }

    if (targetType === "event") {
      pushAssumption(
        assumptions,
        "Event beginner-friendliness and timing relevance were inferred from event tags, source verification, and available time windows.",
        "event_metadata",
        decayedConfidence(0.78, newestSourceAt),
        "medium",
        -0.02,
        0.04,
        "medium",
        -0.02
      );
    }

    if (targetType === "student") {
      const peer = target as Student;
      const sameDepartment = peer.department === student.department;
      pushAssumption(
        assumptions,
        sameDepartment
          ? "Shared department suggests useful academic context for connection."
          : "Cross-department overlap was treated as potentially valuable because interests or skills overlap.",
        sameDepartment ? "academic_context" : "cross_domain_matching",
        decayedConfidence(sameDepartment ? 0.8 : 0.58, peer.created_at ?? student.created_at),
        sameDepartment ? "low" : "medium",
        sameDepartment ? 0.01 : -0.02,
        sameDepartment ? 0.03 : 0.05,
        sameDepartment ? "low" : "medium",
        sameDepartment ? 0.01 : -0.02
      );
    }

    if (relevantSignals.some((signal) => signal.signal_type === "interest_inferred")) {
      pushAssumption(
        assumptions,
        "Inferred interests contributed to the ranking because explicit profile data was incomplete.",
        "student_signals",
        decayedConfidence(0.55, newestSignalAt),
        "medium",
        -0.04,
        0.07,
        "medium",
        -0.04
      );
    }

    if (!sources.length) {
      pushAssumption(
        assumptions,
        "Source reliability defaulted to unknown because no explicit data source was attached.",
        "missing_source_metadata",
        0.2,
        "high",
        -0.06,
        0.06,
        "high",
        -0.06
      );
    }

    return assumptions;
  } catch (error) {
    logStructuredError("assumption_engine", error);
    return [];
  }
}

export function assumptionRiskPenalty(assumptions: RecommendationAssumptionInput[]) {
  if (!assumptions.length) {
    return 0;
  }

  return clamp(
    assumptions.reduce((sum, item) => {
      if (item.risk_level === "high" && !item.is_user_confirmed) return sum + 0.1;
      if (item.risk_level === "medium" && !item.is_user_confirmed) return sum + 0.05;
      return sum;
    }, 0),
    0,
    0.15
  );
}
