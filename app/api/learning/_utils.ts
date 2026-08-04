import { NextResponse } from "next/server";

import { LearningAccessError } from "@/services/learning/access";
import { authErrorResponse } from "@/services/auth/guards";

export function learningErrorResponse(error: unknown) {
  if (error instanceof LearningAccessError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return authErrorResponse(error);
}
