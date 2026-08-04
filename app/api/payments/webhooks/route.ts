import { NextResponse } from "next/server";

import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { handleProviderWebhook } from "@/services/payments/checkout-service";
import { paymentErrorResponse } from "@/app/api/payments/_utils";

/** Public webhook endpoint — signature validated by gateway adapter */
export async function POST(request: Request) {
  try {
    ensurePaymentsSeeded();
    const payload = await request.text();
    const signature =
      request.headers.get("stripe-signature") ??
      request.headers.get("x-aep-webhook-signature");
    const result = await handleProviderWebhook({ payload, signature });
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
