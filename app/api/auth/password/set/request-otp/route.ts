import { enforceRateLimit, genericOtpResponse, otpCooldownResponse, otpSendFailedResponse, sendOtpForPurpose } from "@/services/auth/auth-handlers";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { isSessionUser, requireSessionUser } from "@/services/auth/require-session";

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const disabled = emailOtpDisabledResponse();
  if (disabled) return disabled;
  try {
    if (!(await enforceRateLimit(request, user.email))) {
      return genericOtpResponse(user.email);
    }

    await sendOtpForPurpose({
      email: user.email,
      fullName: user.fullName,
      purpose: "SET_PASSWORD",
      userId: user.id,
    });

    return genericOtpResponse(user.email);
  } catch (error) {
    const cooldown = otpCooldownResponse(error);
    if (cooldown) return cooldown;
    return otpSendFailedResponse();
  }
}
