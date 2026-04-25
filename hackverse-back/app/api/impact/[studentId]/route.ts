import { getStudentById } from "@/lib/db";
import { computeImpactProfile } from "@/lib/impact-service";
import { assertExists, handleRouteError, ok, validateUuidParam } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await context.params;
    validateUuidParam(studentId, "INVALID_ID");

    await assertExists(
      await getStudentById(studentId),
      "etudiant introuvable",
      "STUDENT_NOT_FOUND"
    );

    const impact = await computeImpactProfile(studentId);
    return ok(impact);
  } catch (error) {
    return handleRouteError(error, "impossible de calculer l'impact", "IMPACT_FETCH_FAILED");
  }
}
