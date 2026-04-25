import { createSignal, getStudentById } from "@/lib/db";
import { assertExists, handleRouteError, ok, parseBody, requireObject } from "@/lib/http";
import { sanitizeSignalPayload } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = requireObject(await parseBody<Record<string, unknown>>(request));
    const sanitized = sanitizeSignalPayload(payload);

    await assertExists(
      await getStudentById(sanitized.student_id as string),
      "utilisateur inexistant",
      "STUDENT_NOT_FOUND",
      400
    );

    const signal = await createSignal(sanitized);
    return ok(signal, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "impossible de creer le signal", "SIGNAL_CREATE_FAILED");
  }
}
