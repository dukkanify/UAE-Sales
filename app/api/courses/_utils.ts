import { NextResponse } from "next/server";

import { CourseValidationError } from "@/services/courses/validation";
import { authErrorResponse } from "@/services/auth/guards";

export function courseErrorResponse(error: unknown) {
  if (error instanceof CourseValidationError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: 400 },
    );
  }
  return authErrorResponse(error);
}
