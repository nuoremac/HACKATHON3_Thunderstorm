import { createFeedback } from "@/lib/db";
import { computeImpactProfile } from "@/lib/impact-service";
import { badRequest, created, parseJson, serverError } from "@/lib/http";
import type { Feedback } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await parseJson<Partial<Feedback>>(request);
    if (!payload.request_id || !payload.from_student_id || !payload.to_student_id || payload.rating == null) {
      return badRequest("request_id, from_student_id, to_student_id, and rating are required");
    }

    const record = await createFeedback(payload);
    const impact = await computeImpactProfile(payload.to_student_id);
    return created({ data: record, impact });
  } catch (error) {
    return serverError("Failed to submit feedback", String(error));
  }
}
