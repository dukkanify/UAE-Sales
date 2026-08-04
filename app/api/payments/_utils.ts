import { NextResponse } from "next/server";

import { PaymentError } from "@/services/payments/access";
import { authErrorResponse } from "@/services/auth/guards";

export function paymentErrorResponse(error: unknown) {
  if (error instanceof PaymentError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return authErrorResponse(error);
}
