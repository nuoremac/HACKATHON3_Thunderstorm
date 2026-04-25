import type { Recommendation, RecommendationScores, RiskLevel } from "@/types/campus";

const weights: Record<keyof Omit<RecommendationScores, "missingDataPenalty" | "conflictPenalty" | "assumptionRiskPenalty">, number> = {
  interest: 0.25,
  skill: 0.2,
  availability: 0.2,
  academicContext: 0.1,
  location: 0.1,
  socialProof: 0.05,
  freshness: 0.03,
  sourceReliability: 0.05,
  exploration: 0.02,
};

const riskPenalty: Record<RiskLevel, number> = {
  low: 0,
  medium: 0.05,
  high: 0.1,
};

export function calculateRecommendationScore(scores: RecommendationScores) {
  const positiveScore = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + scores[key as keyof typeof weights] * weight;
  }, 0);

  const penalties =
    scores.missingDataPenalty + scores.conflictPenalty + scores.assumptionRiskPenalty;

  return clamp01(positiveScore - penalties);
}

export function calculateConfidence(recommendation: Recommendation) {
  const confirmedAssumptions = recommendation.assumptions.filter(
    (assumption) => assumption.confirmed,
  ).length;
  const assumptionRatio =
    recommendation.assumptions.length > 0
      ? confirmedAssumptions / recommendation.assumptions.length
      : 0.5;

  const averageAssumptionConfidence =
    recommendation.assumptions.reduce((sum, assumption) => sum + assumption.confidence, 0) /
    recommendation.assumptions.length;

  const noConflictScore = 1 - recommendation.scores.conflictPenalty;

  return clamp01(
    0.4 * recommendation.scores.sourceReliability +
      0.25 * averageAssumptionConfidence +
      0.2 * recommendation.scores.freshness +
      0.1 * noConflictScore +
      0.05 * assumptionRatio,
  );
}

export function getDominantRisk(recommendation: Recommendation): RiskLevel {
  if (recommendation.assumptions.some((assumption) => assumption.risk === "high")) {
    return "high";
  }

  if (recommendation.assumptions.some((assumption) => assumption.risk === "medium")) {
    return "medium";
  }

  return "low";
}

export function getAssumptionRiskPenalty(recommendation: Recommendation) {
  const strongestPenalty = recommendation.assumptions.reduce((maxPenalty, assumption) => {
    return Math.max(maxPenalty, riskPenalty[assumption.risk]);
  }, 0);

  return Math.max(strongestPenalty, recommendation.scores.assumptionRiskPenalty);
}

export function scoreAsPercent(score: number) {
  return Math.round(clamp01(score) * 100);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}
