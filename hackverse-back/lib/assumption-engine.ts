import { clamp } from "@/lib/http";
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
  is_user_confirmed = false
) {
  assumptions.push({
    assumption,
    source,
    confidence: clamp(confidence),
    risk_level,
    confidence_impact,
    is_user_confirmed
  });
}

export function buildAssumptions(context: CandidateContext): RecommendationAssumptionInput[] {
  const assumptions: RecommendationAssumptionInput[] = [];
  const { student, target, targetType, relevantSignals, timetableSlots, sources } = context;

  if (!student.interests.length && targetType !== "help_opportunity") {
    pushAssumption(
      assumptions,
      "Missing interests were bridged from department-level and signal-level patterns.",
      "system_inference",
      0.45,
      "high",
      -0.08
    );
  }

  if (!student.availability.length && !timetableSlots.length) {
    pushAssumption(
      assumptions,
      "Availability was estimated from sparse profile data because no explicit schedule was provided.",
      "missing_profile_data",
      0.35,
      "high",
      -0.1
    );
  }

  if (targetType === "association") {
    pushAssumption(
      assumptions,
      "Association relevance was inferred from overlaps between student interests and association mission tags.",
      "association_tags",
      0.72,
      "medium",
      -0.03
    );
  }

  if (targetType === "event") {
    pushAssumption(
      assumptions,
      "Event beginner-friendliness and timing relevance were inferred from event tags, source verification, and available time windows.",
      "event_metadata",
      0.78,
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
      sameDepartment ? 0.8 : 0.58,
      sameDepartment ? "low" : "medium",
      sameDepartment ? 0.01 : -0.02
    );
  }

  if (relevantSignals.some((signal) => signal.signal_type === "interest_inferred")) {
    pushAssumption(
      assumptions,
      "Inferred interests contributed to the ranking because explicit profile data was incomplete.",
      "student_signals",
      0.55,
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
      -0.06
    );
  }

  return assumptions;
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
