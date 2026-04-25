import { buildAdminQualityMetrics } from "@/lib/admin-service";
import { handleRouteError, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const metrics = await buildAdminQualityMetrics();
    return ok(metrics);
  } catch (error) {
    return handleRouteError(
      error,
      "impossible de charger les metriques de qualite",
      "ADMIN_QUALITY_FAILED"
    );
  }
}
