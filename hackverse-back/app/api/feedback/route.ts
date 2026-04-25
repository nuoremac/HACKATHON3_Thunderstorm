import {
  createFeedback,
  getHelpRequestById,
  getStudentById
} from "@/lib/db";
import { computeImpactProfile } from "@/lib/impact-service";
import { apiError, assertExists, handleRouteError, ok, parseBody, requireObject } from "@/lib/http";
import { sanitizeFeedbackPayload } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = requireObject(await parseBody<Record<string, unknown>>(request));
    const sanitized = sanitizeFeedbackPayload(payload);

    const [helpRequest, fromStudent, toStudent] = await Promise.all([
      getHelpRequestById(sanitized.request_id as string),
      getStudentById(sanitized.from_student_id as string),
      getStudentById(sanitized.to_student_id as string)
    ]);

    const requestRecord = assertExists(
      helpRequest,
      "demande d'aide introuvable",
      "HELP_REQUEST_NOT_FOUND",
      400
    );
    assertExists(fromStudent, "utilisateur inexistant", "STUDENT_NOT_FOUND", 400);
    assertExists(toStudent, "utilisateur inexistant", "STUDENT_NOT_FOUND", 400);

    if (sanitized.from_student_id === sanitized.to_student_id) {
      throw apiError(422, "feedback invalide", "INVALID_FEEDBACK_RELATION");
    }

    const participants = [requestRecord.requester_id, requestRecord.helper_id].filter(Boolean);
    if (
      !participants.includes(sanitized.from_student_id as string) ||
      !participants.includes(sanitized.to_student_id as string)
    ) {
      throw apiError(422, "feedback non coherent avec la demande", "FEEDBACK_PARTICIPANT_MISMATCH");
    }

    if (requestRecord.status !== "completed") {
      throw apiError(422, "la demande doit etre terminee avant feedback", "HELP_REQUEST_NOT_COMPLETED");
    }

    const record = await createFeedback(sanitized);
    const impact = await computeImpactProfile(sanitized.to_student_id as string);
    return ok({ feedback: record, impact }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "impossible d'enregistrer le feedback", "FEEDBACK_CREATE_FAILED");
  }
}
