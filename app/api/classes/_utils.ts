import { NextResponse } from "next/server";

import { ClassValidationError } from "@/services/classes/validation";
import { authErrorResponse } from "@/services/auth/guards";

export function classErrorResponse(error: unknown) {
  if (error instanceof ClassValidationError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: 400 },
    );
  }
  return authErrorResponse(error);
}
