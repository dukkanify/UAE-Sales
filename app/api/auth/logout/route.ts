import { NextResponse } from "next/server";

import { signOut } from "@/services/auth/auth-service";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";

export async function POST(request: Request) {
  await ensureCsrfToken();
  const result = await signOut(getRequestContext(request));
  return NextResponse.json(result);
}
