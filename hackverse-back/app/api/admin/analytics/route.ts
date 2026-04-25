import { buildAdminAnalytics } from "@/lib/admin-service";
import { handleRouteError, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const analytics = await buildAdminAnalytics();
    return ok(analytics);
  } catch (error) {
    return handleRouteError(error, "impossible de charger les analytics", "ADMIN_ANALYTICS_FAILED");
  }
}
