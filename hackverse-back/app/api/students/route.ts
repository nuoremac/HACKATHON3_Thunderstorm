import { createStudent, getStudentByEmail, listStudents } from "@/lib/db";
import { conflict, handleRouteError, ok, parseBody, requireObject } from "@/lib/http";
import { sanitizeStudentPayload } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const students = await listStudents();
    return ok(students);
  } catch (error) {
    return handleRouteError(error, "impossible de recuperer les etudiants", "STUDENT_LIST_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const payload = requireObject(await parseBody<Record<string, unknown>>(request));
    const sanitized = sanitizeStudentPayload(payload, "create");

    const existing = await getStudentByEmail(sanitized.email as string);
    if (existing) {
      return conflict("email deja utilise", "EMAIL_ALREADY_EXISTS");
    }

    const student = await createStudent(sanitized);
    return ok(student, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "impossible de creer l'etudiant", "STUDENT_CREATE_FAILED");
  }
}
