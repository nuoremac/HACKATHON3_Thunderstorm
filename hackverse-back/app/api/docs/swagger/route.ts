import { swaggerDocument } from "@/docs/swagger";
import { ok } from "@/lib/http";

export async function GET() {
  return ok(swaggerDocument);
}
