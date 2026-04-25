import { buildAdminAnalytics } from "@/lib/admin-service";
import { ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const analytics = await buildAdminAnalytics();
    return ok(analytics);
  } catch (error) {
    return serverError("Failed to load admin analytics", String(error));
  }
}
