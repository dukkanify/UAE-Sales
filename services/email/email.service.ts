import { BRAND, BRAND_COLORS } from "@/shared/constants/brand";
import { getAppUrl } from "@/shared/constants/site";

type SendEmailInput = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

const RESEND_ONBOARDING_FROM = `${BRAND.nameEn} <beth.t@example.com>`;
const EMAIL_TIMEOUT_MS = 8_000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getFromAddress(): string {
  const name = process.env.EMAIL_FROM_NAME?.trim() || BRAND.nameEn;
  const address = process.env.EMAIL_FROM_ADDRESS?.trim() || "no-reply@sooqna.site";
  return `${name} <${address}>`;
}

function extractEmailAddress(from: string): string {
  return from.match(/<([^>]+)>/)?.[1]?.trim().toLowerCase() ?? from.trim().toLowerCase();
}

async function postResend(
  from: string,
  input: SendEmailInput,
  apiKey: string,
): Promise<{ body: string; ok: boolean; status: number }> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
    signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
  });
  const body = await response.text();
  return { body, ok: response.ok, status: response.status };
}

async function sendWithResend(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[Sooqna Email] RESEND_API_KEY is not set; email not sent", {
      to: input.to,
      subject: input.subject,
    });
    return false;
  }

  const primaryFrom = getFromAddress();
  try {
    const first = await postResend(primaryFrom, input, apiKey);
    if (first.ok) {
      console.info("[Sooqna Email] sent", { to: input.to, subject: input.subject });
      return true;
    }

    console.error("[Sooqna Email] Resend rejected", {
      to: input.to,
      subject: input.subject,
      from: primaryFrom,
      status: first.status,
      body: first.body.slice(0, 500),
    });

    const primaryAddress = extractEmailAddress(primaryFrom);
    if (primaryAddress.endsWith("@resend.dev")) {
      return false;
    }

    const retry = await postResend(RESEND_ONBOARDING_FROM, input, apiKey);
    if (retry.ok) {
      console.warn(
        "[Sooqna Email] sent via Resend onboarding sender; verify sooqna.site in Resend",
        { to: input.to, subject: input.subject },
      );
      return true;
    }

    console.error("[Sooqna Email] Resend retry rejected", {
      to: input.to,
      subject: input.subject,
      status: retry.status,
      body: retry.body.slice(0, 500),
    });
    return false;
  } catch (error) {
    console.error("[Sooqna Email] Resend request failed", {
      to: input.to,
      subject: input.subject,
      error: error instanceof Error ? error.message : error,
    });
    return false;
  }
}

async function deliverEmail(input: SendEmailInput): Promise<void> {
  const sent = await sendWithResend(input);

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
  } catch (error) {
    console.error("[Sooqna Email] delivery failed", {
      to: input.to,
      subject: input.subject,
      error: error instanceof Error ? error.message : error,
    });
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

function buildWelcomeEmailHtml(name: string, appUrl: string): string {
  const safeName = escapeHtml(name);
  const browseUrl = `${appUrl}/search`;
  const postUrl = `${appUrl}/listings/new`;
  const profileUrl = `${appUrl}/profile`;
  const navy = BRAND_COLORS.navy;
  const gold = BRAND_COLORS.gold;
  const cream = BRAND_COLORS.white;

  return `
    <div style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:${cream};color:${navy};direction:rtl;text-align:right;">
      <div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid ${gold};">
        <strong style="font-size:24px;color:${navy};">${BRAND.nameAr} ${BRAND.nameEn}</strong>
        <p style="margin:8px 0 0;font-size:13px;color:#555;">${BRAND.taglineAr}</p>
      </div>
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${safeName}،</p>
      <p style="font-size:16px;line-height:1.8;">تم إنشاء حسابك بنجاح في ${BRAND.nameAr}. يسعدنا انضمامك إلى سوق الإمارات للبيع والشراء بثقة.</p>
      <p style="font-size:16px;line-height:1.8;">يمكنك الآن تصفّح العروض، نشر إعلانك، أو إدارة حسابك من لوحة التحكم.</p>
      <div style="margin:28px 0;text-align:center;">
        <a href="${browseUrl}" style="display:inline-block;margin:6px;padding:12px 22px;background:${gold};color:${navy};text-decoration:none;border-radius:12px;font-weight:700;">تصفّح العروض</a>
        <a href="${postUrl}" style="display:inline-block;margin:6px;padding:12px 22px;background:${navy};color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;">أضف إعلانك</a>
      </div>
      <p style="font-size:14px;line-height:1.8;color:#555;">حسابك: <a href="${profileUrl}" style="color:${navy};">${profileUrl}</a></p>
      <p style="font-size:14px;margin-top:32px;color:#555;">فريق ${BRAND.nameAr}</p>
    </div>
  `.trim();
}

function buildWelcomeEmailText(name: string, appUrl: string): string {
  return [
    `مرحبًا ${name}،`,
    "",
    `تم إنشاء حسابك بنجاح في ${BRAND.nameAr}. يسعدنا انضمامك إلى سوق الإمارات للبيع والشراء بثقة.`,
    "",
    `تصفّح العروض: ${appUrl}/search`,
    `أضف إعلانك: ${appUrl}/listings/new`,
    `حسابك: ${appUrl}/profile`,
    "",
    `فريق ${BRAND.nameAr}`,
  ].join("\n");
}

export async function sendWelcomeEmail(input: {
  email: string;
  name: string;
}): Promise<boolean> {
  const name = input.name.trim() || "عميل سوقنا";
  const appUrl = getAppUrl();
  return deliverEmailSafely({
    to: input.email,
    subject: `مرحبًا بك في ${BRAND.nameAr} — حسابك جاهز`,
    html: buildWelcomeEmailHtml(name, appUrl),
    text: buildWelcomeEmailText(name, appUrl),
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

type EmailParty = {
  email: string;
  name: string;
};

function buildTransactionalHtml(body: string): string {
  return `
    <div style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#FAF9F7;color:#0B1628;direction:rtl;text-align:right;">
      <div style="text-align:center;margin-bottom:24px;">
        <strong style="font-size:22px;color:#0B1628;">سوقنا Sooqna</strong>
      </div>
      ${body}
      <p style="font-size:14px;margin-top:32px;color:#555;">فريق سوقنا</p>
    </div>
  `.trim();
}

export async function sendViewingBookingEmails(input: {
  buyer: EmailParty;
  seller: EmailParty;
  listingTitle: string;
  date: string;
  time: string;
}): Promise<void> {
  const buyerHtml = buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${input.buyer.name}،</p>
      <p style="font-size:16px;line-height:1.8;">تم تأكيد حجز معاينة لعقار «${input.listingTitle}».</p>
      <p style="font-size:16px;line-height:1.8;">التاريخ: <strong>${input.date}</strong><br/>الوقت: <strong>${input.time}</strong></p>
    `);
  const sellerHtml = buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${input.seller.name}،</p>
      <p style="font-size:16px;line-height:1.8;">حجز معاينة جديد على إعلانك «${input.listingTitle}» من ${input.buyer.name}.</p>
      <p style="font-size:16px;line-height:1.8;">التاريخ: <strong>${input.date}</strong><br/>الوقت: <strong>${input.time}</strong></p>
    `);

  await Promise.all([
    deliverEmailSafely({
      to: input.buyer.email,
      subject: `تأكيد معاينة — ${input.listingTitle}`,
      html: buyerHtml,
      text: `مرحبًا ${input.buyer.name}،\nتم تأكيد معاينة «${input.listingTitle}» بتاريخ ${input.date} الساعة ${input.time}.\nفريق سوقنا`,
    }),
    deliverEmailSafely({
      to: input.seller.email,
      subject: `حجز معاينة جديد — ${input.listingTitle}`,
      html: sellerHtml,
      text: `مرحبًا ${input.seller.name}،\n${input.buyer.name} حجز معاينة لـ «${input.listingTitle}» بتاريخ ${input.date} الساعة ${input.time}.\nفريق سوقنا`,
    }),
  ]);
}

export async function sendJobApplicationEmails(input: {
  buyer: EmailParty;
  seller: EmailParty;
  listingTitle: string;
}): Promise<void> {
  const applicantHtml = buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${input.buyer.name}،</p>
      <p style="font-size:16px;line-height:1.8;">تم إرسال طلبك على وظيفة «${input.listingTitle}» بنجاح.</p>
    `);
  const employerHtml = buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${input.seller.name}،</p>
      <p style="font-size:16px;line-height:1.8;">طلب توظيف جديد من ${input.buyer.name} على وظيفة «${input.listingTitle}».</p>
    `);

  await Promise.all([
    deliverEmailSafely({
      to: input.buyer.email,
      subject: `طلب توظيف — ${input.listingTitle}`,
      html: applicantHtml,
      text: `مرحبًا ${input.buyer.name}،\nتم إرسال طلبك على وظيفة «${input.listingTitle}» بنجاح.\nفريق سوقنا`,
    }),
    deliverEmailSafely({
      to: input.seller.email,
      subject: `طلب توظيف جديد — ${input.listingTitle}`,
      html: employerHtml,
      text: `مرحبًا ${input.seller.name}،\n${input.buyer.name} قدّم على وظيفة «${input.listingTitle}».\nفريق سوقنا`,
    }),
  ]);
}
