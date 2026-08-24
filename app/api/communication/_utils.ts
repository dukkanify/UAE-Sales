import { NextResponse } from "next/server";

import { CommunicationError } from "@/services/communication/access";
import { authErrorResponse } from "@/services/auth/guards";

export function communicationErrorResponse(error: unknown) {
  if (error instanceof CommunicationError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return authErrorResponse(error);
}
