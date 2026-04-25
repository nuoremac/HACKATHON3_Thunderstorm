import { createStudent, listStudents } from "@/lib/db";
import { badRequest, created, ok, parseJson, serverError } from "@/lib/http";
import type { Student } from "@/lib/types";

export async function GET() {
  try {
    const students = await listStudents();
    return ok({ data: students });
  } catch (error) {
    return serverError("Failed to fetch students", String(error));
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJson<Partial<Student>>(request);
    if (!payload.name || !payload.email || !payload.department || !payload.academic_year) {
      return badRequest("name, email, department, and academic_year are required");
    }

    const student = await createStudent({
      ...payload,
      interests: payload.interests ?? [],
      skills_offered: payload.skills_offered ?? [],
      skills_needed: payload.skills_needed ?? [],
      availability: payload.availability ?? [],
      profile_links: payload.profile_links ?? null,
      privacy_level: payload.privacy_level ?? "campus",
      profile_completeness: payload.profile_completeness ?? 0.4
    });

    return created({ data: student });
  } catch (error) {
    return serverError("Failed to create student", String(error));
  }
}
