function readBooleanFlag(name: string, defaultValue: boolean) {
  const raw = process.env[name];
  if (raw == null) return defaultValue;
  return !["false", "0", "off", "no"].includes(raw.toLowerCase());
}

function readNumberFlag(name: string, defaultValue: number) {
  const raw = process.env[name];
  if (raw == null) return defaultValue;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export const featureFlags = {
  enableDataTrustLayer: readBooleanFlag("ENABLE_DATA_TRUST_LAYER", true),
  enableFallbackMode: readBooleanFlag("ENABLE_FALLBACK_MODE", true),
  enableConflictResolution: readBooleanFlag("ENABLE_CONFLICT_RESOLUTION", true),
  fallbackConfidenceThreshold: readNumberFlag("FALLBACK_CONFIDENCE_THRESHOLD", 0.55)
};
