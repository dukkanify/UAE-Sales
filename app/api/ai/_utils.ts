import { NextResponse } from "next/server";

import { AiError } from "@/services/ai/access";
import { authErrorResponse } from "@/services/auth/guards";

export function aiErrorResponse(error: unknown) {
  if (error instanceof AiError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return authErrorResponse(error);
}
