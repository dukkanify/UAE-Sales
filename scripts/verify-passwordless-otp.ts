/**
 * Passwordless OTP production verification script.
 * Run: npx tsx scripts/verify-passwordless-otp.ts
 * Production demo check: NODE_ENV=production ENABLE_DEMO_OTP=false npx tsx scripts/verify-passwordless-otp.ts
 */
import { createOtpRequest, verifyOtpCode } from "../services/otp/otp.service";
import { isDemoOtpEnabled } from "../services/otp/otp-config";

async function run() {
  const results: Array<{ name: string; pass: boolean; detail?: string }> = [];

  function check(name: string, pass: boolean, detail?: string) {
    results.push({ name, pass, detail });
    console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  }

  check(
    "Production demo OTP gate",
    process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_OTP !== "true"
      ? !isDemoOtpEnabled()
      : true,
    `enabled=${isDemoOtpEnabled()}`,
  );

  const email = `qa-${Date.now()}@sooqna.test`;
  const { record, code } = await createOtpRequest({
    email,
    purpose: "REGISTER",
    metadata: { fullName: "QA User", userId: "qa-user" },
  });
  check("OTP stored as hash", record.otpHash !== code && record.otpHash.length === 64);
  check("OTP purpose bound", record.purpose === "REGISTER");

  const ok = await verifyOtpCode({ email, purpose: "REGISTER", code });
  check("Correct OTP verifies", ok.ok === true);

  const reuse = await verifyOtpCode({ email, purpose: "REGISTER", code });
  check("Reused OTP fails", !reuse.ok && reuse.reason === "NOT_FOUND");

  const loginEmail = `login-${Date.now()}@test.com`;
  const { code: loginCode } = await createOtpRequest({ email: loginEmail, purpose: "LOGIN" });
  const cross = await verifyOtpCode({ email: loginEmail, purpose: "REGISTER", code: loginCode });
  check("Cross-purpose rejected", !cross.ok);

  const wrongEmail = `wrong-${Date.now()}@test.com`;
  await createOtpRequest({ email: wrongEmail, purpose: "LOGIN" });
  const wrong = await verifyOtpCode({ email: wrongEmail, purpose: "LOGIN", code: "000000" });
  check(
    "Wrong OTP invalid",
    !wrong.ok && wrong.reason === "INVALID",
    !wrong.ok ? `remaining=${wrong.attemptsRemaining}` : undefined,
  );

  const resendEmail = `resend-${Date.now()}@test.com`;
  const first = await createOtpRequest({ email: resendEmail, purpose: "REGISTER" });
  let cooldownBlocked = false;
  try {
    await createOtpRequest({ email: resendEmail, purpose: "REGISTER" });
  } catch (e) {
    cooldownBlocked = e instanceof Error && e.message.startsWith("RESEND_COOLDOWN:");
  }
  check("Resend cooldown enforced", cooldownBlocked);
  const stillValid = await verifyOtpCode({ email: resendEmail, purpose: "REGISTER", code: first.code });
  check("OTP valid during cooldown", stillValid.ok === true);

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exit(passed === results.length ? 0 : 1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
