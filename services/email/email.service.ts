import { BRAND, BRAND_COLORS } from "@/shared/constants/brand";
import { getAppUrl } from "@/shared/constants/site";
import { logProductionConfigIssues } from "@/services/auth/production-config";
import {
  buildSooqnaEmailHtml,
  buildSooqnaEmailText,
} from "@/services/email/sooqna-email-template";
import { resolveEmailLocale } from "@/shared/i18n/email-locale";

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
    logProductionConfigIssues("email-send");
    console.error("[Sooqna Email] RESEND_API_KEY is not set; email not sent", {
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

function buildOtpEmailHtml(
  name: string,
  otp: string,
  intro: string,
  locale: "ar" | "en",
): string {
  const english = locale === "en";
  const expiry = english
    ? "The code expires in 10 minutes.<br/>If you did not request this code, you can ignore this email.<br/>Do not share this verification code with anyone."
    : "تنتهي صلاحية الرمز خلال 10 دقائق.<br/>إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.<br/>لا تشارك رمز التحقق مع أي شخص.";
  return buildSooqnaEmailHtml({
    locale,
    title: english ? "Your verification code" : "رمز التحقق",
    bodyHtml: `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">${english ? "Hello" : "مرحبًا"} ${name}${english ? "," : "،"}</p>
      <p style="font-size:16px;line-height:1.8;margin:0;">${intro}</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px;text-align:center;margin:24px 0;direction:ltr;">${otp}</p>
      <p style="font-size:14px;line-height:1.8;color:#555;">${expiry}</p>`,
  });
}

function buildOtpEmailText(
  name: string,
  otp: string,
  intro: string,
  locale: "ar" | "en",
): string {
  const english = locale === "en";
  return buildSooqnaEmailText({
    locale,
    title: english ? "Your verification code" : "رمز التحقق",
    bodyLines: [
      `${english ? "Hello" : "مرحبًا"} ${name}${english ? "," : "،"}`,
      intro,
      otp,
      english
        ? "The code expires in 10 minutes."
        : "تنتهي صلاحية الرمز خلال 10 دقائق.",
      english
        ? "If you did not request this code, you can ignore this email."
        : "إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.",
    ],
  });
}

async function sendPurposeOtp(input: {
  email: string;
  introAr: string;
  introEn: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  const locale = await resolveEmailLocale({ email: input.email });
  const intro = locale === "en" ? input.introEn : input.introAr;
  const safeName = escapeHtml(input.name.trim() || (locale === "en" ? "Sooqna customer" : "عميل سوقنا"));
  return deliverEmailSafely({
    to: input.email,
    subject:
      locale === "en"
        ? "Your Sooqna verification code"
        : "رمز التحقق الخاص بك في سوقنا",
    html: buildOtpEmailHtml(safeName, input.otp, intro, locale),
    text: buildOtpEmailText(safeName, input.otp, intro, locale),
  });
}

export async function sendRegistrationOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPurposeOtp({
    ...input,
    introAr: "استخدم رمز التحقق التالي لإكمال التسجيل في سوقنا:",
    introEn: "Use the following code to complete your Sooqna registration:",
  });
}

export async function sendLoginOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPurposeOtp({
    ...input,
    introAr: "استخدم رمز التحقق التالي لتسجيل الدخول إلى سوقنا:",
    introEn: "Use the following code to sign in to Sooqna:",
  });
}

export async function sendSetPasswordOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPurposeOtp({
    ...input,
    introAr: "استخدم رمز التحقق التالي لإضافة كلمة مرور لحسابك في سوقنا:",
    introEn: "Use the following code to add a password to your Sooqna account:",
  });
}

export async function sendPasswordResetOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPurposeOtp({
    ...input,
    introAr: "استخدم رمز التحقق التالي لإعادة تعيين كلمة المرور في سوقنا:",
    introEn: "Use the following code to reset your Sooqna password:",
  });
}

export async function sendEmailChangeOtp(input: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  return sendPurposeOtp({
    ...input,
    introAr: "استخدم رمز التحقق التالي لتأكيد تغيير بريدك الإلكتروني في سوقنا:",
    introEn: "Use the following code to confirm your email change on Sooqna:",
  });
}

async function buildWelcomeEmailHtml(
  name: string,
  appUrl: string,
  locale: "ar" | "en",
): Promise<string> {
  const safeName = escapeHtml(name);
  const browseUrl = `${appUrl}/search`;
  const profileUrl = `${appUrl}/profile`;
  const english = locale === "en";
  const body = english
    ? `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">Hello ${safeName},</p>
      <p style="font-size:16px;line-height:1.8;margin:0 0 12px;">Your Sooqna account is ready. Welcome to a trusted UAE marketplace for buying and selling.</p>
      <p style="font-size:16px;line-height:1.8;margin:0;">You can now browse listings, post an ad, or manage your account from the dashboard.</p>
      <p style="font-size:14px;line-height:1.8;margin:20px 0 0;color:#555;">Your account: <a href="${profileUrl}">${profileUrl}</a></p>`
    : `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">مرحبًا ${safeName}،</p>
      <p style="font-size:16px;line-height:1.8;margin:0 0 12px;">تم إنشاء حسابك بنجاح في ${BRAND.nameAr}. يسعدنا انضمامك إلى سوق الإمارات للبيع والشراء بثقة.</p>
      <p style="font-size:16px;line-height:1.8;margin:0;">يمكنك الآن تصفّح العروض، نشر إعلانك، أو إدارة حسابك من لوحة التحكم.</p>
      <p style="font-size:14px;line-height:1.8;margin:20px 0 0;color:#555;">حسابك: <a href="${profileUrl}">${profileUrl}</a></p>`;
  return buildSooqnaEmailHtml({
    locale,
    title: english ? "Welcome to Sooqna" : `مرحبًا بك في ${BRAND.nameAr}`,
    bodyHtml: body,
    ctaHref: browseUrl,
    ctaLabel: english ? "Browse listings" : "تصفّح العروض",
  }) + (english
    ? ""
    : "");
}

function buildWelcomeEmailText(name: string, appUrl: string, locale: "ar" | "en"): string {
  const english = locale === "en";
  return buildSooqnaEmailText({
    locale,
    title: english ? "Welcome to Sooqna" : `مرحبًا بك في ${BRAND.nameAr}`,
    bodyLines: english
      ? [
          `Hello ${name},`,
          "Your Sooqna account is ready. Welcome to a trusted UAE marketplace for buying and selling.",
          `Browse listings: ${appUrl}/search`,
          `Post an ad: ${appUrl}/listings/new`,
          `Your account: ${appUrl}/profile`,
        ]
      : [
          `مرحبًا ${name}،`,
          `تم إنشاء حسابك بنجاح في ${BRAND.nameAr}. يسعدنا انضمامك إلى سوق الإمارات للبيع والشراء بثقة.`,
          `تصفّح العروض: ${appUrl}/search`,
          `أضف إعلانك: ${appUrl}/listings/new`,
          `حسابك: ${appUrl}/profile`,
        ],
    ctaHref: `${appUrl}/listings/new`,
    ctaLabel: english ? "Post an Ad" : "أضف إعلانك",
  });
}

export async function sendWelcomeEmail(input: {
  email: string;
  name: string;
}): Promise<boolean> {
  const locale = await resolveEmailLocale({ email: input.email });
  const name = input.name.trim() || (locale === "en" ? "Sooqna customer" : "عميل سوقنا");
  const appUrl = getAppUrl();
  return deliverEmailSafely({
    to: input.email,
    subject:
      locale === "en"
        ? "Welcome to Sooqna — your account is ready"
        : `مرحبًا بك في ${BRAND.nameAr} — حسابك جاهز`,
    html: await buildWelcomeEmailHtml(name, appUrl, locale),
    text: buildWelcomeEmailText(name, appUrl, locale),
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

function buildTransactionalHtml(body: string, locale: "ar" | "en" = "ar"): string {
  return buildSooqnaEmailHtml({
    locale,
    title: locale === "en" ? "Sooqna" : "سوقنا",
    bodyHtml: body,
  });
}

function listingLinkHtml(url: string, locale: "ar" | "en" = "ar"): string {
  const label = locale === "en" ? "View listing" : "عرض الإعلان";
  return `<p style="text-align:center;margin:24px 0;"><a href="${url}" style="display:inline-block;padding:12px 22px;background:${BRAND_COLORS.gold};color:${BRAND_COLORS.navy};text-decoration:none;border-radius:12px;font-weight:700;">${label}</a></p>`;
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
  const locale = await resolveEmailLocale({ email: input.buyer.email });
  const english = locale === "en";
  const title = escapeHtml(input.listingTitle);
  const buyerName = escapeHtml(input.buyer.name);
  const date = escapeHtml(input.date);
  const time = escapeHtml(input.time);
  const visitors =
    typeof input.visitors === "number" ? String(input.visitors) : "";
  const phone = input.phone ? escapeHtml(input.phone) : "";
  const details = english
    ? `Date: <strong>${date}</strong><br/>Time: <strong>${time}</strong>${visitors ? `<br/>Visitors: <strong>${visitors}</strong>` : ""}${phone ? `<br/>Contact: <strong dir="ltr">${phone}</strong>` : ""}`
    : `التاريخ: <strong>${date}</strong><br/>الوقت: <strong>${time}</strong>${visitors ? `<br/>عدد الزوار: <strong>${visitors}</strong>` : ""}${phone ? `<br/>رقم التواصل: <strong dir="ltr">${phone}</strong>` : ""}`;

  const buyerHtml = buildTransactionalHtml(
    english
      ? `<p style="font-size:16px;line-height:1.8;">Hello ${buyerName},</p>
      <p style="font-size:16px;line-height:1.8;">A property viewing has been confirmed for “${title}”.</p>
      <p style="font-size:16px;line-height:1.8;">${details}</p>
      ${listingLinkHtml(input.listingUrl, locale)}`
      : `<p style="font-size:16px;line-height:1.8;">مرحبًا ${buyerName}،</p>
      <p style="font-size:16px;line-height:1.8;">تم تأكيد حجز معاينة لعقار «${title}».</p>
      <p style="font-size:16px;line-height:1.8;">${details}</p>
      ${listingLinkHtml(input.listingUrl, locale)}`,
    locale,
  );

  const buyerEmailed = await deliverEmailSafely({
    to: input.buyer.email,
    subject: english
      ? `Viewing confirmed — ${input.listingTitle}`
      : `تأكيد معاينة — ${input.listingTitle}`,
    html: buyerHtml,
    text: english
      ? [
          `Hello ${input.buyer.name},`,
          `A viewing was confirmed for “${input.listingTitle}”.`,
          `Date: ${input.date}`,
          `Time: ${input.time}`,
          input.listingUrl,
        ].join("\n")
      : [
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

  const sellerLocale = await resolveEmailLocale({ email: input.seller.email });
  const sellerEnglish = sellerLocale === "en";
  const sellerName = escapeHtml(input.seller.name);
  const sellerHtml = buildTransactionalHtml(
    sellerEnglish
      ? `<p style="font-size:16px;line-height:1.8;">Hello ${sellerName},</p>
      <p style="font-size:16px;line-height:1.8;">${buyerName} booked a viewing on “${title}”.</p>
      <p style="font-size:16px;line-height:1.8;">Date: <strong>${date}</strong><br/>Time: <strong>${time}</strong></p>
      ${listingLinkHtml(input.listingUrl, sellerLocale)}`
      : `<p style="font-size:16px;line-height:1.8;">مرحبًا ${sellerName}،</p>
      <p style="font-size:16px;line-height:1.8;">حجز معاينة جديد على إعلانك «${title}» من ${buyerName}.</p>
      <p style="font-size:16px;line-height:1.8;">التاريخ: <strong>${date}</strong><br/>الوقت: <strong>${time}</strong></p>
      ${listingLinkHtml(input.listingUrl, sellerLocale)}`,
    sellerLocale,
  );

  const sellerEmailed = await deliverEmailSafely({
    to: input.seller.email,
    subject: sellerEnglish
      ? `New viewing request — ${input.listingTitle}`
      : `حجز معاينة جديد — ${input.listingTitle}`,
    html: sellerHtml,
    text: sellerEnglish
      ? `Hello ${input.seller.name},\n${input.buyer.name} booked a viewing for “${input.listingTitle}” on ${input.date} at ${input.time}.\n${input.listingUrl}`
      : `مرحبًا ${input.seller.name}،\n${input.buyer.name} حجز معاينة لـ «${input.listingTitle}» بتاريخ ${input.date} الساعة ${input.time}.\n${input.listingUrl}\nفريق سوقنا`,
  });

  return { buyerEmailed, sellerEmailed };
}

export async function sendJobApplicationEmails(input: {
  buyer: EmailParty;
  seller?: EmailParty;
  listingTitle: string;
  listingUrl: string;
}): Promise<{ buyerEmailed: boolean; sellerEmailed: boolean }> {
  const locale = await resolveEmailLocale({ email: input.buyer.email });
  const english = locale === "en";
  const title = escapeHtml(input.listingTitle);
  const buyerName = escapeHtml(input.buyer.name);

  const buyerEmailed = await deliverEmailSafely({
    to: input.buyer.email,
    subject: english
      ? `Job application confirmation — ${input.listingTitle}`
      : `تأكيد طلب التوظيف — ${input.listingTitle}`,
    html: buildTransactionalHtml(
      english
        ? `<p style="font-size:16px;line-height:1.8;">Hello ${buyerName},</p>
      <p style="font-size:16px;line-height:1.8;">We received your application for “${title}”. We will notify you when the status changes.</p>
      ${listingLinkHtml(input.listingUrl, locale)}`
        : `<p style="font-size:16px;line-height:1.8;">مرحبًا ${buyerName}،</p>
      <p style="font-size:16px;line-height:1.8;">تم استلام طلبك على وظيفة «${title}» بنجاح. سنُعلمك عند تحديث الحالة.</p>
      ${listingLinkHtml(input.listingUrl, locale)}`,
      locale,
    ),
    text: english
      ? `Hello ${input.buyer.name},\nYour application for “${input.listingTitle}” was sent.\n${input.listingUrl}`
      : `مرحبًا ${input.buyer.name}،\nتم إرسال طلبك على وظيفة «${input.listingTitle}» بنجاح.\n${input.listingUrl}\nفريق سوقنا`,
  });

  if (!input.seller?.email) {
    return { buyerEmailed, sellerEmailed: false };
  }

  const sellerLocale = await resolveEmailLocale({ email: input.seller.email });
  const sellerEnglish = sellerLocale === "en";
  const sellerName = escapeHtml(input.seller.name);
  const sellerEmailed = await deliverEmailSafely({
    to: input.seller.email,
    subject: sellerEnglish
      ? `New job application — ${input.listingTitle}`
      : `طلب توظيف جديد — ${input.listingTitle}`,
    html: buildTransactionalHtml(
      sellerEnglish
        ? `<p style="font-size:16px;line-height:1.8;">Hello ${sellerName},</p>
      <p style="font-size:16px;line-height:1.8;">${buyerName} applied for “${title}”.</p>
      ${listingLinkHtml(input.listingUrl, sellerLocale)}`
        : `<p style="font-size:16px;line-height:1.8;">مرحبًا ${sellerName}،</p>
      <p style="font-size:16px;line-height:1.8;">طلب توظيف جديد من ${buyerName} على وظيفة «${title}».</p>
      ${listingLinkHtml(input.listingUrl, sellerLocale)}`,
      sellerLocale,
    ),
    text: sellerEnglish
      ? `Hello ${input.seller.name},\n${input.buyer.name} applied for “${input.listingTitle}”.\n${input.listingUrl}`
      : `مرحبًا ${input.seller.name}،\n${input.buyer.name} قدّم على وظيفة «${input.listingTitle}».\n${input.listingUrl}\nفريق سوقنا`,
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
  const locale = await resolveEmailLocale({ email: input.buyer.email });
  const english = locale === "en";
  const title = escapeHtml(input.listingTitle);
  const buyerName = escapeHtml(input.buyer.name);
  const isBooking = input.kind === "service_booking";
  const buyerSubject = english
    ? isBooking
      ? `Service booking confirmation — ${input.listingTitle}`
      : `Quote request confirmation — ${input.listingTitle}`
    : isBooking
      ? `تأكيد طلب حجز الخدمة — ${input.listingTitle}`
      : `تأكيد طلب عرض السعر — ${input.listingTitle}`;
  const schedule =
    input.preferredDate && input.preferredTime
      ? english
        ? `<p style="font-size:16px;line-height:1.8;">Preferred time: <strong>${escapeHtml(input.preferredDate)}</strong> at <strong>${escapeHtml(input.preferredTime)}</strong></p>`
        : `<p style="font-size:16px;line-height:1.8;">الموعد المفضل: <strong>${escapeHtml(input.preferredDate)}</strong> الساعة <strong>${escapeHtml(input.preferredTime)}</strong></p>`
      : "";

  const buyerEmailed = await deliverEmailSafely({
    to: input.buyer.email,
    subject: buyerSubject,
    html: buildTransactionalHtml(
      english
        ? `<p style="font-size:16px;line-height:1.8;">Hello ${buyerName},</p>
      <p style="font-size:16px;line-height:1.8;">${isBooking ? "We received your service booking" : "We received your quote request"} for “${title}”. The provider will contact you shortly.</p>
      ${schedule}
      ${listingLinkHtml(input.listingUrl, locale)}`
        : `<p style="font-size:16px;line-height:1.8;">مرحبًا ${buyerName}،</p>
      <p style="font-size:16px;line-height:1.8;">${isBooking ? "تم استلام طلب حجز الخدمة" : "تم استلام طلب عرض السعر"} لـ «${title}». سيتواصل مزود الخدمة معك قريبًا.</p>
      ${schedule}
      ${listingLinkHtml(input.listingUrl, locale)}`,
      locale,
    ),
    text: english
      ? `Hello ${input.buyer.name},\nWe received your request for “${input.listingTitle}”.\n${input.listingUrl}`
      : `مرحبًا ${input.buyer.name}،\nتم استلام طلبك لـ «${input.listingTitle}».\n${input.listingUrl}\nفريق سوقنا`,
  });

  if (!input.seller?.email) {
    return { buyerEmailed, sellerEmailed: false };
  }

  const sellerLocale = await resolveEmailLocale({ email: input.seller.email });
  const sellerEnglish = sellerLocale === "en";
  const sellerName = escapeHtml(input.seller.name);
  const sellerEmailed = await deliverEmailSafely({
    to: input.seller.email,
    subject: sellerEnglish
      ? `New service request — ${input.listingTitle}`
      : `طلب خدمة جديد — ${input.listingTitle}`,
    html: buildTransactionalHtml(
      sellerEnglish
        ? `<p style="font-size:16px;line-height:1.8;">Hello ${sellerName},</p>
      <p style="font-size:16px;line-height:1.8;">${buyerName} sent a request for “${title}”.</p>
      ${schedule}
      ${listingLinkHtml(input.listingUrl, sellerLocale)}`
        : `<p style="font-size:16px;line-height:1.8;">مرحبًا ${sellerName}،</p>
      <p style="font-size:16px;line-height:1.8;">${buyerName} أرسل طلبًا على «${title}».</p>
      ${schedule}
      ${listingLinkHtml(input.listingUrl, sellerLocale)}`,
      sellerLocale,
    ),
    text: sellerEnglish
      ? `Hello ${input.seller.name},\n${input.buyer.name} requested a service for “${input.listingTitle}”.\n${input.listingUrl}`
      : `مرحبًا ${input.seller.name}،\n${input.buyer.name} طلب خدمة لـ «${input.listingTitle}».\n${input.listingUrl}\nفريق سوقنا`,
  });

  return { buyerEmailed, sellerEmailed };
}
