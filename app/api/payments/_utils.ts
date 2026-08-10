import { NextResponse } from "next/server";

import { PaymentError } from "@/services/payments/access";
import { InstallmentError } from "@/services/payments/installment-service";
import { authErrorResponse } from "@/services/auth/guards";

export function paymentErrorResponse(error: unknown) {
  if (error instanceof PaymentError || error instanceof InstallmentError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  if (error instanceof Error && /Payment mode|Passport|agreement/i.test(error.message)) {
    return NextResponse.json({ success: false, data: null, error: error.message }, { status: 400 });
  }
  return authErrorResponse(error);
}
