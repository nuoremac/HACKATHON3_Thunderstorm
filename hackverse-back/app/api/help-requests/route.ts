import { createHelpRequest } from "@/lib/db";
import { badRequest, created, parseJson, serverError } from "@/lib/http";
import type { HelpRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await parseJson<Partial<HelpRequest>>(request);
    if (!payload.requester_id || !payload.skill || !payload.message) {
      return badRequest("requester_id, skill, and message are required");
    }

    const record = await createHelpRequest({
      ...payload,
      status: payload.status ?? "open",
      request_type: payload.request_type ?? "ask_for_help"
    });

    return created({ data: record });
  } catch (error) {
    return serverError("Failed to create help request", String(error));
  }
}
