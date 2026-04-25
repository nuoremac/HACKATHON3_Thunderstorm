import type { CandidateContext, RecommendationExplanation, Student } from "@/lib/types";

function readableDataPoint(label: string, present: boolean) {
  return present ? label : `${label} (partial)`;
}

export function buildExplanation(
  context: CandidateContext,
  scoreBreakdown: {
    InterestScore: number;
    SkillScore: number;
    AvailabilityScore: number;
    AcademicContextScore: number;
    LocationScore: number;
    SocialProofScore: number;
    FreshnessScore: number;
    SourceReliabilityScore: number;
    ExplorationScore: number;
  },
  assumptionsUsed: string[]
): RecommendationExplanation {
  const { student, targetType, target, relevantSignals, sources } = context;

  const whyThisRecommendation: string[] = [];
  const whyNow: string[] = [];
  const dataUsed: string[] = [];

  if (scoreBreakdown.InterestScore > 0) {
    whyThisRecommendation.push("Interest overlap created a strong contextual match.");
  }
  if (scoreBreakdown.SkillScore > 0) {
    whyThisRecommendation.push("Skill alignment suggests a meaningful help or collaboration opportunity.");
  }
  if (scoreBreakdown.AcademicContextScore > 0.6) {
    whyThisRecommendation.push("Academic context indicates this is relevant to the student's department or year.");
  }
  if (scoreBreakdown.SocialProofScore >= 0.7) {
    whyThisRecommendation.push("Social proof is strong from prior feedback or engagement.");
  }
  if (scoreBreakdown.ExplorationScore >= 0.5) {
    whyThisRecommendation.push("An exploration signal was intentionally included to avoid locking the student into early assumptions.");
  }

  if (scoreBreakdown.AvailabilityScore > 0) {
    whyNow.push("Current timing and availability create a usable connection window.");
  }
  if (scoreBreakdown.FreshnessScore >= 0.7) {
    whyNow.push("The supporting data is recent enough to trust for a timely recommendation.");
  }

  if (targetType === "event") {
    whyNow.push("The event timing aligns with the student's active discovery window.");
  } else if (targetType === "association") {
    whyNow.push("Association activity and recruitment signals suggest this is a good moment to engage.");
  } else if (targetType === "student") {
    whyNow.push("Peer connection is recommended because skills, interests, or academic context overlap right now.");
  } else {
    whyNow.push("The help opportunity is actionable because the need and potential helper availability overlap.");
  }

  dataUsed.push(
    readableDataPoint("student interests", student.interests.length > 0),
    readableDataPoint("student skills", student.skills_offered.length > 0 || student.skills_needed.length > 0),
    readableDataPoint("student availability", student.availability.length > 0),
    readableDataPoint("student academic context", Boolean(student.department && student.academic_year)),
    readableDataPoint("data source reliability", sources.length > 0),
    readableDataPoint("student signals", relevantSignals.length > 0)
  );

  if (targetType === "student") {
    const peer = target as Student;
    dataUsed.push(readableDataPoint("peer profile", Boolean(peer.name)));
  }

  return {
    why_this_recommendation: whyThisRecommendation,
    why_now: whyNow,
    data_used: dataUsed,
    assumptions_used: assumptionsUsed
  };
}
