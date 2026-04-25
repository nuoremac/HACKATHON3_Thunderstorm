import { generateRecommendations } from "@/lib/recommendation-service";
import { notFound, ok, serverError } from "@/lib/http";

export async function GET(_: Request, context: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await context.params;
    const recommendations = await generateRecommendations(studentId);
    if (!recommendations) return notFound("Student not found");
    return ok(recommendations);
  } catch (error) {
    return serverError("Failed to generate recommendations", String(error));
  }
}
