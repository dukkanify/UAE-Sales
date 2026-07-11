type SendEmailInput = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

function getFromAddress(): string {
  const name = process.env.EMAIL_FROM_NAME?.trim() || "Sooqna";
  const address = process.env.EMAIL_FROM_ADDRESS?.trim() || "no-reply@sooqna.site";
  return `${name} <${address}>`;
}

async function sendWithResend(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  return response.ok;
}

async function deliverEmail(input: SendEmailInput): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER?.trim() || "resend";
  const sent = provider === "resend" ? await sendWithResend(input) : await sendWithResend(input);

  if (sent) {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[Sooqna Email:dev]", input.to, input.subject);
    return;
  }

  throw new Error("EMAIL_SEND_FAILED");
}

/** Delivers email without throwing when provider is unavailable. */
export async function deliverEmailSafely(input: SendEmailInput): Promise<boolean> {
  try {
    await deliverEmail(input);
    return true;
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.info("[Sooqna Email:queued]", input.to, input.subject);
    }
    return false;
  }
}

function buildOtpEmailHtml(name: string, otp: string, intro: string): string {
  return `
    <div style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#FAF9F7;color:#0B1628;direction:rtl;text-align:right;">
      <div style="text-align:center;margin-bottom:24px;">
        <strong style="font-size:22px;color:#0B1628;">سوقنا Sooqna</strong>
      </div>
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${name}،</p>
      <p style="font-size:16px;line-height:1.8;">${intro}</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px;text-align:center;margin:24px 0;color:#0B1628;">${otp}</p>
      <p style="font-size:14px;line-height:1.8;color:#555;">تنتهي صلاحية الرمز خلال 10 دقائق.<br/>إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.<br/>لا تشارك رمز التحقق مع أي شخص.</p>
      <p style="font-size:14px;margin-top:32px;color:#555;">فريق سوقنا</p>
    </div>
  `.trim();
}

function buildOtpEmailText(name: string, otp: string, intro: string): string {
  return [
    `مرحبًا ${name}،`,
    "",
    intro,
    otp,
    "",
    "تنتهي صلاحية الرمز خلال 10 دقائق.",
    "إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.",
    "لا تشارك رمز التحقق مع أي شخص.",
    "",
    "فريق سوقنا",
  ].join("\n");
}

async function sendPurposeOtp(input: {
  email: string;
  intro: string;
  name: string;
  otp: string;
}): Promise<void> {
  await deliverEmail({
    to: input.email,
    subject: "رمز التحقق الخاص بك في سوقنا",
    html: buildOtpEmailHtml(input.name, input.otp, input.intro),
    text: buildOtpEmailText(input.name, input.otp, input.intro),
  });
}

export async function sendRegistrationOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendPurposeOtp({
    ...input,
    intro: "استخدم رمز التحقق التالي لإكمال التسجيل في سوقنا:",
  });
}

export async function sendLoginOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendPurposeOtp({
    ...input,
    intro: "استخدم رمز التحقق التالي لتسجيل الدخول إلى سوقنا:",
  });
}

export async function sendSetPasswordOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendPurposeOtp({
    ...input,
    intro: "استخدم رمز التحقق التالي لإضافة كلمة مرور لحسابك في سوقنا:",
  });
}

export async function sendPasswordResetOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendPurposeOtp({
    ...input,
    intro: "استخدم رمز التحقق التالي لإعادة تعيين كلمة المرور في سوقنا:",
  });
}

export async function sendEmailChangeOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendPurposeOtp({
    ...input,
    intro: "استخدم رمز التحقق التالي لتأكيد تغيير بريدك الإلكتروني في سوقنا:",
  });
}

export async function sendWelcomeEmail(input: {
  email: string;
  name: string;
}): Promise<void> {
  await deliverEmail({
    to: input.email,
    subject: "مرحبًا بك في سوقنا",
    html: `<p style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;">مرحبًا ${input.name}،<br/>تم إنشاء حسابك بنجاح في سوقنا.</p>`,
    text: `مرحبًا ${input.name}،\nتم إنشاء حسابك بنجاح في سوقنا.`,
  });
}

/** @deprecated Use purpose-specific senders */
export async function sendOtpEmail(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendRegistrationOtp(input);
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendPasswordResetOtp(input);
}

export async function sendLoginVerificationEmail(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendLoginOtp(input);
}
