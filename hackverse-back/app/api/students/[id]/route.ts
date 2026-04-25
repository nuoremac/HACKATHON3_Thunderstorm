import { getStudentById, updateStudent } from "@/lib/db";
import { badRequest, notFound, ok, parseJson, serverError } from "@/lib/http";
import type { Student } from "@/lib/types";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const student = await getStudentById(id);
    if (!student) return notFound("Student not found");
    return ok({ data: student });
  } catch (error) {
    return serverError("Failed to fetch student", String(error));
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = await parseJson<Partial<Student>>(request);
    if (!Object.keys(payload).length) return badRequest("At least one field is required");
    const student = await updateStudent(id, payload);
    if (!student) return notFound("Student not found");
    return ok({ data: student });
  } catch (error) {
    return serverError("Failed to update student", String(error));
  }
}
