import { createSignal } from "@/lib/db";
import { badRequest, created, parseJson, serverError } from "@/lib/http";
import type { StudentSignal } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await parseJson<Partial<StudentSignal>>(request);
    if (!payload.student_id || !payload.signal_type || !payload.value || !payload.source) {
      return badRequest("student_id, signal_type, value, and source are required");
    }

    const signal = await createSignal({
      ...payload,
      confidence: payload.confidence ?? 0.5
    });

    return created({ data: signal });
  } catch (error) {
    return serverError("Failed to create signal", String(error));
  }
}
