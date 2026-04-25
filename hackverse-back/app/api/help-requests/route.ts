import { createHelpRequest, getStudentById } from "@/lib/db";
import { apiError, assertExists, handleRouteError, ok, parseBody, requireObject } from "@/lib/http";
import { sanitizeHelpRequestPayload } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = requireObject(await parseBody<Record<string, unknown>>(request));
    const sanitized = sanitizeHelpRequestPayload(payload, "create");

    await assertExists(
      await getStudentById(sanitized.requester_id as string),
      "utilisateur inexistant",
      "STUDENT_NOT_FOUND",
      400
    );

    if (sanitized.helper_id) {
      await assertExists(
        await getStudentById(sanitized.helper_id),
        "utilisateur inexistant",
        "STUDENT_NOT_FOUND",
        400
      );
    }

    if (sanitized.helper_id && sanitized.helper_id === sanitized.requester_id) {
      throw apiError(
        422,
        "le demandeur ne peut pas etre son propre helper",
        "INVALID_HELP_REQUEST_RELATION"
      );
    }

    if (sanitized.status === "completed" && !sanitized.helper_id) {
      throw apiError(422, "un helper est requis pour terminer la demande", "HELPER_REQUIRED");
    }

    const record = await createHelpRequest(sanitized);
    return ok(record, { status: 201 });
  } catch (error) {
    return handleRouteError(
      error,
      "impossible de creer la demande d'aide",
      "HELP_REQUEST_CREATE_FAILED"
    );
  }
}
