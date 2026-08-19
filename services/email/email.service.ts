import { BRAND, BRAND_COLORS } from "@/shared/constants/brand";
import { getAppUrl } from "@/shared/constants/site";
import {
  buildSooqnaEmailHtml,
  buildSooqnaEmailText,
  escapeEmailHtml,
} from "@/services/email/sooqna-email-template";

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
  const name = process.env.EMAIL_FROM_NAME?.trim() || "Sooqna | سوقنا";
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
  const provider = (process.env.EMAIL_PROVIDER ?? "resend").trim().toLowerCase();
  if (provider && provider !== "resend") {
    console.warn("[Sooqna Email] EMAIL_PROVIDER is not resend; using Resend", {
      provider,
    });
  }

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
    const primaryAddress = extractEmailAddress(primaryFrom);
    if (first.ok) {
      if (primaryAddress.endsWith("@resend.dev")) {
        console.warn(
          "[Sooqna Email] Resend onboarding sender cannot reach third-party inboxes",
          { to: input.to, subject: input.subject, from: primaryFrom },
        );
        return false;
      }
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

    if (primaryAddress.endsWith("@resend.dev")) {
      return false;
    }

    const retry = await postResend(RESEND_ONBOARDING_FROM, input, apiKey);
    if (retry.ok) {
      console.warn(
        "[Sooqna Email] Resend onboarding sender cannot reach third-party inboxes",
        { to: input.to, subject: input.subject },
      );
      return false;
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

async function deliverEmail(input: SendEmailInput): Promise<boolean> {
  return sendWithResend(input);
}

/** Delivers email without throwing when provider is unavailable. */
export async function deliverEmailSafely(input: SendEmailInput): Promise<boolean> {
  try {
    const sent = await deliverEmail(input);
    if (!sent) {
      console.warn("[Sooqna Email] not delivered", {
        to: input.to,
        subject: input.subject,
      });
    }
    return sent;
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
  return buildSooqnaEmailHtml({
    title: "رمز التحقق",
    preview: "رمز التحقق الخاص بك في سوقنا",
    bodyHtml: `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">مرحبًا ${escapeEmailHtml(name)}،</p><p style="font-size:16px;line-height:1.8;margin:0;">${escapeEmailHtml(intro)}</p><p style="font-size:32px;font-weight:700;letter-spacing:6px;text-align:center;margin:24px 0;color:${BRAND_COLORS.navy};">${escapeEmailHtml(otp)}</p><p style="font-size:14px;line-height:1.8;margin:0;color:#6b6560;">تنتهي صلاحية الرمز خلال 10 دقائق. إذا لم تطلب هذا الرمز، تجاهل الرسالة. لا تشارك الرمز مع أي شخص.</p>`,
  });
}

function buildOtpEmailText(name: string, otp: string, intro: string): string {
  return buildSooqnaEmailText({
    title: "رمز التحقق",
    bodyLines: [
      `مرحبًا ${name}،`,
      intro,
      otp,
      "تنتهي صلاحية الرمز خلال 10 دقائق.",
      "إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.",
      "لا تشارك رمز التحقق مع أي شخص.",
    ],
  });
}

async function sendPurposeOtp(input: {
  email: string;
  intro: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return deliverEmailSafely({
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
}): Promise<boolean> {
  return sendPurposeOtp({
    ...input,
    intro: "استخدم رمز التحقق التالي لإكمال التسجيل في سوقنا:",
  });
}

export async function sendLoginOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPurposeOtp({
    ...input,
    intro: "استخدم رمز التحقق التالي لتسجيل الدخول إلى سوقنا:",
  });
}

export async function sendSetPasswordOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPurposeOtp({
    ...input,
    intro: "استخدم رمز التحقق التالي لإضافة كلمة مرور لحسابك في سوقنا:",
  });
}

export async function sendPasswordResetOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPurposeOtp({
    ...input,
    intro: "استخدم رمز التحقق التالي لإعادة تعيين كلمة المرور في سوقنا:",
  });
}

export async function sendEmailChangeOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPurposeOtp({
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
}): Promise<boolean> {
  return sendRegistrationOtp(input);
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPasswordResetOtp(input);
}

export async function sendLoginVerificationEmail(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendLoginOtp(input);
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

function listingLinkHtml(url: string): string {
  return `<p style="text-align:center;margin:24px 0;"><a href="${url}" style="display:inline-block;padding:12px 22px;background:${BRAND_COLORS.gold};color:${BRAND_COLORS.navy};text-decoration:none;border-radius:12px;font-weight:700;">عرض الإعلان</a></p>`;
}

export async function sendViewingBookingEmails(input: {
  buyer: EmailParty;
  seller?: EmailParty;
  listingTitle: string;
  listingUrl: string;
  date: string;
  time: string;
  phone?: string;
  visitors?: number;
}): Promise<{ buyerEmailed: boolean; sellerEmailed: boolean }> {
  const title = escapeHtml(input.listingTitle);
  const buyerName = escapeHtml(input.buyer.name);
  const date = escapeHtml(input.date);
  const time = escapeHtml(input.time);
  const visitors =
    typeof input.visitors === "number" ? String(input.visitors) : "";
  const phone = input.phone ? escapeHtml(input.phone) : "";

  const buyerHtml = buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${buyerName}،</p>
      <p style="font-size:16px;line-height:1.8;">تم تأكيد حجز معاينة لعقار «${title}».</p>
      <p style="font-size:16px;line-height:1.8;">التاريخ: <strong>${date}</strong><br/>الوقت: <strong>${time}</strong>${visitors ? `<br/>عدد الزوار: <strong>${visitors}</strong>` : ""}${phone ? `<br/>رقم التواصل: <strong dir="ltr">${phone}</strong>` : ""}</p>
      ${listingLinkHtml(input.listingUrl)}
    `);

  const buyerEmailed = await deliverEmailSafely({
    to: input.buyer.email,
    subject: `تأكيد معاينة — ${input.listingTitle}`,
    html: buyerHtml,
    text: [
      `مرحبًا ${input.buyer.name}،`,
      `تم تأكيد معاينة «${input.listingTitle}».`,
      `التاريخ: ${input.date}`,
      `الوقت: ${input.time}`,
      input.listingUrl,
      "فريق سوقنا",
    ].join("\n"),
  });

  if (!input.seller?.email) {
    return { buyerEmailed, sellerEmailed: false };
  }

  const sellerName = escapeHtml(input.seller.name);
  const sellerHtml = buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${sellerName}،</p>
      <p style="font-size:16px;line-height:1.8;">حجز معاينة جديد على إعلانك «${title}» من ${buyerName}.</p>
      <p style="font-size:16px;line-height:1.8;">التاريخ: <strong>${date}</strong><br/>الوقت: <strong>${time}</strong></p>
      ${listingLinkHtml(input.listingUrl)}
    `);

  const sellerEmailed = await deliverEmailSafely({
    to: input.seller.email,
    subject: `حجز معاينة جديد — ${input.listingTitle}`,
    html: sellerHtml,
    text: `مرحبًا ${input.seller.name}،\n${input.buyer.name} حجز معاينة لـ «${input.listingTitle}» بتاريخ ${input.date} الساعة ${input.time}.\n${input.listingUrl}\nفريق سوقنا`,
  });

  return { buyerEmailed, sellerEmailed };
}

export async function sendJobApplicationEmails(input: {
  buyer: EmailParty;
  seller?: EmailParty;
  listingTitle: string;
  listingUrl: string;
}): Promise<{ buyerEmailed: boolean; sellerEmailed: boolean }> {
  const title = escapeHtml(input.listingTitle);
  const buyerName = escapeHtml(input.buyer.name);

  const buyerEmailed = await deliverEmailSafely({
    to: input.buyer.email,
    subject: `تأكيد طلب التوظيف — ${input.listingTitle}`,
    html: buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${buyerName}،</p>
      <p style="font-size:16px;line-height:1.8;">تم استلام طلبك على وظيفة «${title}» بنجاح. سنُعلمك عند تحديث الحالة.</p>
      ${listingLinkHtml(input.listingUrl)}
    `),
    text: `مرحبًا ${input.buyer.name}،\nتم إرسال طلبك على وظيفة «${input.listingTitle}» بنجاح.\n${input.listingUrl}\nفريق سوقنا`,
  });

  if (!input.seller?.email) {
    return { buyerEmailed, sellerEmailed: false };
  }

  const sellerName = escapeHtml(input.seller.name);
  const sellerEmailed = await deliverEmailSafely({
    to: input.seller.email,
    subject: `طلب توظيف جديد — ${input.listingTitle}`,
    html: buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${sellerName}،</p>
      <p style="font-size:16px;line-height:1.8;">طلب توظيف جديد من ${buyerName} على وظيفة «${title}».</p>
      ${listingLinkHtml(input.listingUrl)}
    `),
    text: `مرحبًا ${input.seller.name}،\n${input.buyer.name} قدّم على وظيفة «${input.listingTitle}».\n${input.listingUrl}\nفريق سوقنا`,
  });

  return { buyerEmailed, sellerEmailed };
}

export async function sendQuoteRequestEmails(input: {
  buyer: EmailParty;
  seller?: EmailParty;
  listingTitle: string;
  listingUrl: string;
  kind: "quote" | "service_booking";
  preferredDate?: string;
  preferredTime?: string;
}): Promise<{ buyerEmailed: boolean; sellerEmailed: boolean }> {
  const title = escapeHtml(input.listingTitle);
  const buyerName = escapeHtml(input.buyer.name);
  const isBooking = input.kind === "service_booking";
  const buyerSubject = isBooking
    ? `تأكيد طلب حجز الخدمة — ${input.listingTitle}`
    : `تأكيد طلب عرض السعر — ${input.listingTitle}`;
  const schedule =
    input.preferredDate && input.preferredTime
      ? `<p style="font-size:16px;line-height:1.8;">الموعد المفضل: <strong>${escapeHtml(input.preferredDate)}</strong> الساعة <strong>${escapeHtml(input.preferredTime)}</strong></p>`
      : "";

  const buyerEmailed = await deliverEmailSafely({
    to: input.buyer.email,
    subject: buyerSubject,
    html: buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${buyerName}،</p>
      <p style="font-size:16px;line-height:1.8;">${isBooking ? "تم استلام طلب حجز الخدمة" : "تم استلام طلب عرض السعر"} لـ «${title}». سيتواصل مزود الخدمة معك قريبًا.</p>
      ${schedule}
      ${listingLinkHtml(input.listingUrl)}
    `),
    text: `مرحبًا ${input.buyer.name}،\nتم استلام طلبك لـ «${input.listingTitle}».\n${input.listingUrl}\nفريق سوقنا`,
  });

  if (!input.seller?.email) {
    return { buyerEmailed, sellerEmailed: false };
  }

  const sellerName = escapeHtml(input.seller.name);
  const sellerEmailed = await deliverEmailSafely({
    to: input.seller.email,
    subject: `طلب خدمة جديد — ${input.listingTitle}`,
    html: buildTransactionalHtml(`
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${sellerName}،</p>
      <p style="font-size:16px;line-height:1.8;">${buyerName} أرسل طلبًا على «${title}».</p>
      ${schedule}
      ${listingLinkHtml(input.listingUrl)}
    `),
    text: `مرحبًا ${input.seller.name}،\n${input.buyer.name} طلب خدمة لـ «${input.listingTitle}».\n${input.listingUrl}\nفريق سوقنا`,
  });

  return { buyerEmailed, sellerEmailed };
}
