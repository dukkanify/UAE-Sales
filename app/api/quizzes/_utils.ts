import { NextResponse } from "next/server";

import { QuizAccessError } from "@/services/quizzes/access";
import { QuizValidationError } from "@/services/quizzes/validation";
import { authErrorResponse } from "@/services/auth/guards";

export function quizErrorResponse(error: unknown) {
  if (error instanceof QuizAccessError || error instanceof QuizValidationError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return authErrorResponse(error);
}
