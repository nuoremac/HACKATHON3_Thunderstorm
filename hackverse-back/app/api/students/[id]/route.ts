import { getStudentByEmail, getStudentById, updateStudent } from "@/lib/db";
import {
  apiError,
  assertExists,
  conflict,
  handleRouteError,
  ok,
  parseBody,
  requireObject,
  validateUuidParam
} from "@/lib/http";
import { sanitizeStudentPayload } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    validateUuidParam(id, "INVALID_ID");

    const student = assertExists(
      await getStudentById(id),
      "etudiant introuvable",
      "STUDENT_NOT_FOUND"
    );
    return ok(student);
  } catch (error) {
    return handleRouteError(error, "impossible de recuperer l'etudiant", "STUDENT_FETCH_FAILED");
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    validateUuidParam(id, "INVALID_ID");

    const existingStudent = assertExists(
      await getStudentById(id),
      "etudiant introuvable",
      "STUDENT_NOT_FOUND"
    );

    const payload = requireObject(await parseBody<Record<string, unknown>>(request));
    if (!Object.keys(payload).length) {
      throw apiError(400, "au moins un champ doit etre fourni", "EMPTY_UPDATE_PAYLOAD");
    }

    const sanitized = sanitizeStudentPayload(payload, "update");
    if (!Object.keys(sanitized).length) {
      throw apiError(400, "au moins un champ doit etre fourni", "EMPTY_UPDATE_PAYLOAD");
    }

    if (sanitized.email && sanitized.email !== existingStudent.email) {
      const duplicate = await getStudentByEmail(sanitized.email);
      if (duplicate && duplicate.id !== id) {
        return conflict("email deja utilise", "EMAIL_ALREADY_EXISTS");
      }
    }

    const student = assertExists(
      await updateStudent(id, sanitized),
      "etudiant introuvable",
      "STUDENT_NOT_FOUND"
    );
    return ok(student);
  } catch (error) {
    return handleRouteError(error, "impossible de mettre a jour l'etudiant", "STUDENT_UPDATE_FAILED");
  }
}
