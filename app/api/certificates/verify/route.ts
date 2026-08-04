import { NextResponse } from "next/server";

import { verifyCertificatePublic } from "@/services/certificates/verification-service";
import { certificateErrorResponse } from "@/app/api/certificates/_utils";

/** Public verification — no auth required. */
export async function GET(request: Request) {
  try {
    const q =
      new URL(request.url).searchParams.get("code") ||
      new URL(request.url).searchParams.get("number") ||
      "";
    return NextResponse.json({
      success: true,
      data: verifyCertificatePublic(q),
      error: null,
    });
  } catch (error) {
    return certificateErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      code?: string;
      number?: string;
    } | null;
    const q = body?.code || body?.number || "";
    return NextResponse.json({
      success: true,
      data: verifyCertificatePublic(q),
      error: null,
    });
  } catch (error) {
    return certificateErrorResponse(error);
  }
}
