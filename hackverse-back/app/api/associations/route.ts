import { createAssociation, listAssociations } from "@/lib/db";
import { handleRouteError, ok, parseBody, requireObject } from "@/lib/http";
import { sanitizeAssociationPayload } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const associations = await listAssociations();
    return ok(associations);
  } catch (error) {
    return handleRouteError(
      error,
      "impossible de recuperer les associations",
      "ASSOCIATION_LIST_FAILED"
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = requireObject(await parseBody<Record<string, unknown>>(request));
    const association = await createAssociation(sanitizeAssociationPayload(payload));
    return ok(association, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "impossible de creer l'association", "ASSOCIATION_CREATE_FAILED");
  }
}
