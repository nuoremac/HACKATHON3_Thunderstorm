import { clamp } from "@/lib/http";

export function computeConfidence(params: {
  sourceReliabilityScore: number;
  profileCompleteness: number;
  freshnessScore: number;
  conflictPenalty: number;
  confidenceImpactFromAssumptions: number;
  trustScore?: number;
  fallbackMode?: boolean;
}) {
  const noConflictScore =
    params.conflictPenalty >= 0.2 ? 0 : params.conflictPenalty >= 0.05 ? 0.5 : 1;

  const baseConfidence =
    0.4 * params.sourceReliabilityScore +
    0.3 * params.profileCompleteness +
    0.2 * params.freshnessScore +
    0.1 * noConflictScore;

  const trustAdjustment = 0.1 * (params.trustScore ?? 0.5);
  const fallbackAdjustment = params.fallbackMode ? -0.05 : 0;

  return clamp(
    baseConfidence + params.confidenceImpactFromAssumptions + trustAdjustment + fallbackAdjustment
  );
}
