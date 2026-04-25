export type StructuredFallbackError = {
  success: false;
  error_code: string;
  message: string;
  fallback_used: boolean;
};

export function createStructuredFallbackError(
  error_code: string,
  message: string,
  fallback_used = true
): StructuredFallbackError {
  return {
    success: false,
    error_code,
    message,
    fallback_used
  };
}

export function logStructuredError(
  scope: string,
  error: unknown,
  extra?: Record<string, unknown>
) {
  console.error({
    scope,
    ...createStructuredFallbackError(
      `${scope.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_ERROR`,
      error instanceof Error ? error.message : String(error),
      true
    ),
    ...(extra ?? {})
  });
}
