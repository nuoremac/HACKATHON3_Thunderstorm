import { getEventById } from "@/lib/db";
import { notFound, ok, serverError } from "@/lib/http";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const event = await getEventById(id);
    if (!event) return notFound("Event not found");
    return ok({ data: event });
  } catch (error) {
    return serverError("Failed to fetch event", String(error));
  }
}
