import {
  getHelpRequestById,
  getStudentById,
  listHelpRequestsForStudent,
  updateHelpRequest
} from "@/lib/db";
import {
  apiError,
  assertExists,
  handleRouteError,
  ok,
  parseBody,
  requireObject,
  validateUuidParam
} from "@/lib/http";
import { sanitizeHelpRequestPayload } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    validateUuidParam(id, "INVALID_ID");

    await assertExists(await getStudentById(id), "etudiant introuvable", "STUDENT_NOT_FOUND");
    const records = await listHelpRequestsForStudent(id);
    return ok(records);
  } catch (error) {
    return handleRouteError(
      error,
      "impossible de recuperer les demandes d'aide",
      "HELP_REQUEST_LIST_FAILED"
    );
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    validateUuidParam(id, "INVALID_ID");

    const existing = assertExists(
      await getHelpRequestById(id),
      "demande d'aide introuvable",
      "HELP_REQUEST_NOT_FOUND"
    );

    const payload = requireObject(await parseBody<Record<string, unknown>>(request));
    if (!Object.keys(payload).length) {
      throw apiError(400, "au moins un champ doit etre fourni", "EMPTY_UPDATE_PAYLOAD");
    }

    const sanitized = sanitizeHelpRequestPayload(payload, "update");
    if (!Object.keys(sanitized).length) {
      throw apiError(400, "au moins un champ doit etre fourni", "EMPTY_UPDATE_PAYLOAD");
    }

    if (sanitized.requester_id) {
      await assertExists(
        await getStudentById(sanitized.requester_id),
        "utilisateur inexistant",
        "STUDENT_NOT_FOUND",
        400
      );
    }
    if (sanitized.helper_id) {
      await assertExists(
        await getStudentById(sanitized.helper_id),
        "utilisateur inexistant",
        "STUDENT_NOT_FOUND",
        400
      );
    }

    const requesterId = sanitized.requester_id ?? existing.requester_id;
    const helperId =
      sanitized.helper_id === undefined ? existing.helper_id : sanitized.helper_id;
    const nextStatus = sanitized.status ?? existing.status;
    const completedAt =
      sanitized.completed_at === undefined ? existing.completed_at : sanitized.completed_at;

    if (helperId && helperId === requesterId) {
      throw apiError(
        422,
        "le demandeur ne peut pas etre son propre helper",
        "INVALID_HELP_REQUEST_RELATION"
      );
    }

    if (nextStatus === "completed" && !helperId) {
      throw apiError(422, "un helper est requis pour terminer la demande", "HELPER_REQUIRED");
    }

    if (nextStatus === "completed" && !completedAt) {
      sanitized.completed_at = new Date().toISOString();
    }

    if (nextStatus !== "completed" && completedAt) {
      throw apiError(
        422,
        "completed_at ne peut etre fourni que pour une demande terminee",
        "INVALID_COMPLETED_AT"
      );
    }

    const record = assertExists(
      await updateHelpRequest(id, sanitized),
      "demande d'aide introuvable",
      "HELP_REQUEST_NOT_FOUND"
    );
    return ok(record);
  } catch (error) {
    return handleRouteError(
      error,
      "impossible de mettre a jour la demande d'aide",
      "HELP_REQUEST_UPDATE_FAILED"
    );
  }
}
