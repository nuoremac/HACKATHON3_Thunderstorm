import { listHelpRequestsForStudent, updateHelpRequest } from "@/lib/db";
import { badRequest, notFound, ok, parseJson, serverError } from "@/lib/http";
import type { HelpRequest } from "@/lib/types";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const records = await listHelpRequestsForStudent(id);
    return ok({ data: records });
  } catch (error) {
    return serverError("Failed to fetch help requests", String(error));
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = await parseJson<Partial<HelpRequest>>(request);
    if (!Object.keys(payload).length) return badRequest("At least one field is required");
    const record = await updateHelpRequest(id, payload);
    if (!record) return notFound("Help request not found");
    return ok({ data: record });
  } catch (error) {
    return serverError("Failed to update help request", String(error));
  }
}
