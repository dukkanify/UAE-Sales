import { NextResponse } from "next/server";

import { CertificateError } from "@/services/certificates/access";
import { authErrorResponse } from "@/services/auth/guards";

export function certificateErrorResponse(error: unknown) {
  if (error instanceof CertificateError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return authErrorResponse(error);
}
