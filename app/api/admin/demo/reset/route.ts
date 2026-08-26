import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";
import { writeOpsLog } from "@/services/ops/logging-service";
import { resetDemoEnvironment } from "@/services/demo/reset-demo-environment";
import { DEMO_ACCOUNT_PASSWORD } from "@/constants/demo-accounts";

/**
 * Super Admin — reset permanent demo accounts and re-apply demo domain data.
 * POST /api/admin/demo/reset
 */
export async function POST(request: Request) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

    const user = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const body = (await request.json().catch(() => null)) as {
      password?: string;
    } | null;

    const password =
      typeof body?.password === "string" && body.password.length >= 8
        ? body.password
        : DEMO_ACCOUNT_PASSWORD;

    const result = resetDemoEnvironment({ password });

    void writeOpsLog({
      level: "info",
      category: "audit",
      message: "Demo environment reset",
      userId: user.id,
      details: {
        accounts: result.accounts.map((a) => a.email),
        studentEnrollments: result.studentEnrollments,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        // Echo password only in non-production so operators can copy it for demos.
        password: process.env.NODE_ENV === "production" ? undefined : result.password,
        hint: "Sign in with demo OTP (ENABLE_DEMO_OTP) or the documented temporary password after reset.",
      },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const { PRIMARY_DEMO_EMAILS, DEMO_ACCOUNT_PASSWORD, DEMO_OTP_CODE_DEFAULT } =
      await import("@/constants/demo-accounts");
    const { findUserByEmail } = await import("@/services/auth/store");

    return NextResponse.json({
      success: true,
      data: {
        accounts: Object.entries(PRIMARY_DEMO_EMAILS).map(([key, email]) => {
          const u = findUserByEmail(email);
          return {
            key,
            email,
            role: u?.role ?? null,
            status: u?.status ?? null,
            exists: Boolean(u),
          };
        }),
        otpHint: DEMO_OTP_CODE_DEFAULT,
        passwordHint: process.env.NODE_ENV === "production" ? null : DEMO_ACCOUNT_PASSWORD,
      },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
