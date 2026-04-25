import { createEvent, listEvents } from "@/lib/db";
import { badRequest, created, ok, parseJson, serverError } from "@/lib/http";
import type { Event } from "@/lib/types";

export async function GET() {
  try {
    const events = await listEvents();
    return ok({ data: events });
  } catch (error) {
    return serverError("Failed to fetch events", String(error));
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJson<Partial<Event>>(request);
    if (!payload.title || !payload.association_id || !payload.start_time || !payload.end_time) {
      return badRequest("title, association_id, start_time, and end_time are required");
    }

    const event = await createEvent({
      ...payload,
      tags: payload.tags ?? [],
      verification_status: payload.verification_status ?? "pending"
    });

    return created({ data: event });
  } catch (error) {
    return serverError("Failed to create event", String(error));
  }
}
