import { getEventById } from "@/lib/db";
import { assertExists, handleRouteError, ok, validateUuidParam } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    validateUuidParam(id, "INVALID_ID");

    const event = assertExists(await getEventById(id), "evenement introuvable", "EVENT_NOT_FOUND");
    return ok(event);
  } catch (error) {
    return handleRouteError(error, "impossible de recuperer l'evenement", "EVENT_FETCH_FAILED");
  }
}
