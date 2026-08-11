import { NextResponse } from "next/server";
import { getServerMetrics } from "../../../backend/services/metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getServerMetrics());
}
