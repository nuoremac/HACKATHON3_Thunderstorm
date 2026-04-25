import { createEvent, getAssociationById, listEvents } from "@/lib/db";
import { assertExists, handleRouteError, ok, parseBody, requireObject } from "@/lib/http";
import { sanitizeEventPayload } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await listEvents();
    return ok(events);
  } catch (error) {
    return handleRouteError(error, "impossible de recuperer les evenements", "EVENT_LIST_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const payload = requireObject(await parseBody<Record<string, unknown>>(request));
    const sanitized = sanitizeEventPayload(payload);

    await assertExists(
      await getAssociationById(sanitized.association_id as string),
      "association inexistante",
      "ASSOCIATION_NOT_FOUND",
      400
    );

    const event = await createEvent(sanitized);
    return ok(event, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "impossible de creer l'evenement", "EVENT_CREATE_FAILED");
  }
}
