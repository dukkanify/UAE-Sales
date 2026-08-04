import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import { searchCommunication } from "@/services/communication/search-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";

export async function GET(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const data = searchCommunication(user, q, Number(searchParams.get("limit") ?? 40));
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
