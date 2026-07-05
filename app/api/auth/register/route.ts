import { registerUser, createOtpVerification } from "@/lib/repositories/auth.repository";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { ApiHttpError, handleApiRoute, jsonCreated } from "@/lib/api/response";
import { parseJsonBody, registerSchema } from "@/lib/api/validation";
import { isDatabaseConfigured } from "@/lib/prisma";
import type { AccountType } from "@prisma/client";

const accountTypeMap: Record<string, AccountType> = {
  individual: "INDIVIDUAL",
  business: "BUSINESS",
  buyer: "BUYER",
  seller: "SELLER",
  company: "COMPANY",
};

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(
        503,
        "SERVER_ERROR",
        "قاعدة البيانات غير مهيأة.",
      );
    }

    const ip = getClientIp(request);
    const rate = await checkRateLimit({
      key: `auth-register:${ip}`,
      limit: 5,
      windowMs: 60_000,
    });

    if (!rate.allowed) {
      throw new ApiHttpError(
        429,
        "RATE_LIMITED",
        "محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.",
      );
    }

    const body = await parseJsonBody(request, registerSchema);
    const user = await registerUser({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      password: body.password,
      accountType: accountTypeMap[body.accountType] ?? "INDIVIDUAL",
      city: body.city,
    });

    await createOtpVerification(body.email, user.id);

    return jsonCreated({ user, otpRequested: true });
  });
}
