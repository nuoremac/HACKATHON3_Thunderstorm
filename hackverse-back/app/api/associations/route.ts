import { createAssociation, listAssociations } from "@/lib/db";
import { badRequest, created, ok, parseJson, serverError } from "@/lib/http";
import type { Association } from "@/lib/types";

export async function GET() {
  try {
    const associations = await listAssociations();
    return ok({ data: associations });
  } catch (error) {
    return serverError("Failed to fetch associations", String(error));
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJson<Partial<Association>>(request);
    if (!payload.name || !payload.description) {
      return badRequest("name and description are required");
    }

    const association = await createAssociation({
      ...payload,
      tags: payload.tags ?? [],
      recruitment_needs: payload.recruitment_needs ?? []
    });

    return created({ data: association });
  } catch (error) {
    return serverError("Failed to create association", String(error));
  }
}
