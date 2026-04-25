import { getStudentById } from "@/lib/db";
import { assertExists, handleRouteError, ok, validateUuidParam } from "@/lib/http";
import { generateRecommendations } from "@/lib/recommendation-service";

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

    const recommendations = await generateRecommendations(studentId);
    return ok(recommendations);
  } catch (error) {
    return handleRouteError(
      error,
      "impossible de generer les recommandations",
      "RECOMMENDATION_GENERATION_FAILED"
    );
  }
}
