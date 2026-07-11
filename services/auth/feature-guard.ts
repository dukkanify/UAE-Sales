import { NextResponse } from "next/server";
import { isEmailOtpEnabled } from "@/shared/constants/feature-flags";

export const FEATURE_DISABLED_RESPONSE = {
  code: "FEATURE_DISABLED",
  message: "هذه الميزة غير متاحة حاليًا.",
} as const;

export function emailOtpDisabledResponse(): NextResponse | null {
  if (isEmailOtpEnabled()) return null;
  return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 403 });
}
