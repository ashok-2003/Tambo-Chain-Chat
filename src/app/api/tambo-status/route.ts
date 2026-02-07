import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const isConfigured = !!process.env.TAMBO_API_KEY;

  return NextResponse.json({ configured: isConfigured });
}
