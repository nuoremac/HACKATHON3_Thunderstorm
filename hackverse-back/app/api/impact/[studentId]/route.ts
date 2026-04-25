import { computeImpactProfile } from "@/lib/impact-service";
import { ok, serverError } from "@/lib/http";

export async function GET(_: Request, context: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await context.params;
    const impact = await computeImpactProfile(studentId);
    return ok(impact);
  } catch (error) {
    return serverError("Failed to compute impact profile", String(error));
  }
}
