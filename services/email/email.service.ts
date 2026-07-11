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
  const sent =
    provider === "resend" ? await sendWithResend(input) : await sendWithResend(input);

  if (sent) {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[Sooqna Email:dev]", input.to, input.subject, input.text);
    return;
  }

  throw new Error("EMAIL_SEND_FAILED");
}

function buildOtpEmailHtml(name: string, otp: string): string {
  return `
    <div style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#FAF9F7;color:#0B1628;direction:rtl;text-align:right;">
      <div style="text-align:center;margin-bottom:24px;">
        <strong style="font-size:22px;color:#0B1628;">سوقنا Sooqna</strong>
      </div>
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${name}،</p>
      <p style="font-size:16px;line-height:1.8;">رمز التحقق الخاص بك هو:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px;text-align:center;margin:24px 0;color:#0B1628;">${otp}</p>
      <p style="font-size:14px;line-height:1.8;color:#555;">تنتهي صلاحية هذا الرمز خلال 10 دقائق.<br/>لا تشارك هذا الرمز مع أي شخص.</p>
      <p style="font-size:14px;margin-top:32px;color:#555;">فريق سوقنا</p>
    </div>
  `.trim();
}

function buildOtpEmailText(name: string, otp: string): string {
  return [
    `مرحبًا ${name}،`,
    "",
    "رمز التحقق الخاص بك هو:",
    otp,
    "",
    "تنتهي صلاحية هذا الرمز خلال 10 دقائق.",
    "لا تشارك هذا الرمز مع أي شخص.",
    "",
    "فريق سوقنا",
  ].join("\n");
}

export async function sendOtpEmail(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await deliverEmail({
    to: input.email,
    subject: "رمز التحقق الخاص بك في سوقنا",
    html: buildOtpEmailHtml(input.name, input.otp),
    text: buildOtpEmailText(input.name, input.otp),
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

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendOtpEmail({ email: input.email, name: input.name, otp: input.otp });
}

export async function sendLoginVerificationEmail(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<void> {
  await sendOtpEmail({ email: input.email, name: input.name, otp: input.otp });
}
