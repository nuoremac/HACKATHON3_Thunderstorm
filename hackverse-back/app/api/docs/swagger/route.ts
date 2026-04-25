import { NextResponse } from "next/server";
import { swaggerDocument } from "@/docs/swagger"; // adapte chemin réel

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(swaggerDocument);
}