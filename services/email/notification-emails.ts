import { findUserById } from "@/services/auth/user-store";
import { sendTransactionalEmail } from "@/services/email/transactional-email";
import {
  EMAIL_SITE_URL,
  emailSiteUrl,
  escapeEmailHtml,
} from "@/services/email/sooqna-email-template";
import { resolveEmailLocale } from "@/shared/i18n/email-locale";
import type { AppLocale } from "@/shared/i18n/locale";
import { tx } from "@/shared/i18n/tx";
import type { Listing } from "@/types";
import type { Order } from "@/types/domain/order";

function greet(name: string, locale: AppLocale): string {
  const fallback = locale === "en" ? "Sooqna customer" : "عميل سوقنا";
  const safe = escapeEmailHtml(name.trim() || fallback);
  if (locale === "en") {
    return `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">Hello ${safe},</p>`;
  }
  return `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">مرحبًا ${safe}،</p>`;
}

export async function emailListingReceived(listing: Listing): Promise<void> {
  const seller = await findUserById(listing.seller.id);
  if (!seller?.email) return;
  const locale = await resolveEmailLocale({ userId: seller.id, email: seller.email });
  const english = locale === "en";
  const href = emailSiteUrl(`/listings/${listing.slug}`);
  const titleHtml = escapeEmailHtml(listing.title);
  await sendTransactionalEmail({
    type: "listing_received",
    to: seller.email,
    userId: seller.id,
    entityId: listing.id,
    locale,
    subject: english
      ? `We received your listing — ${listing.title}`
      : `تم استلام إعلانك — ${listing.title}`,
    title: english ? "Your listing is under review" : "إعلانك قيد المراجعة",
    bodyHtml: english
      ? `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">We received “${titleHtml}” and it is now under review by the Sooqna team. We will email you once it is approved or if changes are needed.</p>`
      : `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">استلمنا إعلان «${titleHtml}» وهو الآن قيد مراجعة فريق سوقنا. سنراسلك فور الموافقة أو إذا احتجنا تعديلاً.</p>`,
    bodyLines: english
      ? [`We received “${listing.title}” and it is under review.`]
      : [`استلمنا إعلان «${listing.title}» وهو قيد المراجعة.`],
    ctaHref: href,
    ctaLabel: english ? "View listing" : "متابعة الإعلان",
  });
}

export async function emailListingApproved(listing: Listing): Promise<void> {
  const seller = await findUserById(listing.seller.id);
  if (!seller?.email) return;
  const locale = await resolveEmailLocale({ userId: seller.id, email: seller.email });
  const english = locale === "en";
  const href = emailSiteUrl(`/listings/${listing.slug}`);
  const titleHtml = escapeEmailHtml(listing.title);
  await sendTransactionalEmail({
    type: "listing_approved",
    to: seller.email,
    userId: seller.id,
    entityId: listing.id,
    locale,
    subject: english
      ? `Your listing has been approved — ${listing.title}`
      : `تمت الموافقة على إعلانك — ${listing.title}`,
    title: english ? "Your listing is now live" : "إعلانك منشور الآن",
    bodyHtml: english
      ? `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">“${titleHtml}” has been approved and is now visible to buyers on Sooqna.</p>`
      : `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">تمت الموافقة على إعلان «${titleHtml}» وأصبح ظاهرًا للمشترين على سوقنا.</p>`,
    bodyLines: english
      ? [`“${listing.title}” has been approved.`]
      : [`تمت الموافقة على إعلان «${listing.title}».`],
    ctaHref: href,
    ctaLabel: english ? "View listing" : "عرض الإعلان",
  });
}

export async function emailListingRejected(
  listing: Listing,
  reason?: string,
): Promise<void> {
  const seller = await findUserById(listing.seller.id);
  if (!seller?.email) return;
  const locale = await resolveEmailLocale({ userId: seller.id, email: seller.email });
  const english = locale === "en";
  const titleHtml = escapeEmailHtml(listing.title);
  const reasonHtml = reason
    ? english
      ? `<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">Reason: ${escapeEmailHtml(reason)}</p>`
      : `<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">السبب: ${escapeEmailHtml(reason)}</p>`
    : "";
  await sendTransactionalEmail({
    type: "listing_rejected",
    to: seller.email,
    userId: seller.id,
    entityId: listing.id,
    locale,
    subject: english
      ? `Your listing needs changes — ${listing.title}`
      : `يحتاج إعلانك إلى تعديل — ${listing.title}`,
    title: english ? "We could not publish the listing" : "لم نتمكن من نشر الإعلان",
    bodyHtml: english
      ? `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">We could not approve “${titleHtml}” in its current form. You can edit it and resubmit.</p>${reasonHtml}`
      : `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">لم تتم الموافقة على إعلان «${titleHtml}» بوضعه الحالي. يمكنك تعديله وإعادة الإرسال.</p>${reasonHtml}`,
    bodyLines: english
      ? [
          `We could not approve “${listing.title}”.`,
          reason ? `Reason: ${reason}` : "Edit the listing and resubmit.",
        ]
      : [
          `لم تتم الموافقة على إعلان «${listing.title}».`,
          reason ? `السبب: ${reason}` : "عدّل الإعلان ثم أعد إرساله.",
        ],
    ctaHref: emailSiteUrl(`/listings/${listing.slug}/edit`),
    ctaLabel: english ? "Edit listing" : "تعديل الإعلان",
  });
}

export async function emailListingFeaturedPaid(listing: Listing): Promise<void> {
  const seller = await findUserById(listing.seller.id);
  if (!seller?.email) return;
  const locale = await resolveEmailLocale({ userId: seller.id, email: seller.email });
  const english = locale === "en";
  const href = emailSiteUrl(`/listings/${listing.slug}`);
  const titleHtml = escapeEmailHtml(listing.title);
  await sendTransactionalEmail({
    type: "featured_paid",
    to: seller.email,
    userId: seller.id,
    entityId: listing.id,
    locale,
    subject: english
      ? `Your listing is now featured — ${listing.title}`
      : `تم تمييز إعلانك — ${listing.title}`,
    title: english ? "Featured package paid" : "تم دفع باقة التمييز",
    bodyHtml: english
      ? `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">Featured payment for “${titleHtml}” is confirmed. It will appear in featured sections for the package duration.</p>`
      : `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">تم تأكيد دفع تمييز إعلان «${titleHtml}». سيظهر في الأقسام المميزة حسب مدة الباقة.</p>`,
    bodyLines: english
      ? [`Featured payment for “${listing.title}” is confirmed.`]
      : [`تم تأكيد دفع تمييز إعلان «${listing.title}».`],
    ctaHref: href,
    ctaLabel: english ? "View listing" : "عرض الإعلان",
  });
}

export async function emailOrderPaid(order: Order): Promise<void> {
  const href = emailSiteUrl(`/orders/${order.id}`);
  if (order.buyerEmail) {
    const locale = await resolveEmailLocale({
      userId: order.buyerId,
      email: order.buyerEmail,
    });
    const english = locale === "en";
    const titleHtml = escapeEmailHtml(order.listingTitle);
    await sendTransactionalEmail({
      type: "order_paid",
      to: order.buyerEmail,
      userId: order.buyerId ?? undefined,
      entityId: order.id,
      locale,
      subject: english
        ? `Payment successful — order ${order.id}`
        : `تم الدفع بنجاح — طلب ${order.id}`,
      title: english ? "Payment received" : "تم استلام الدفع",
      bodyHtml: english
        ? `${greet(order.buyerName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">Payment for “${titleHtml}” succeeded. The amount is held in escrow until receipt is confirmed.</p>`
        : `${greet(order.buyerName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">تم دفع طلب «${titleHtml}» بنجاح. المبلغ محجوز في الضمان حتى تأكيد الاستلام.</p>`,
      bodyLines: english
        ? [`Payment for “${order.listingTitle}” was received.`, `Order number: ${order.id}`]
        : [`تم دفع طلب «${order.listingTitle}».`, `رقم الطلب: ${order.id}`],
      ctaHref: href,
      ctaLabel: english ? "Track order" : "متابعة الطلب",
    });
  }

  const seller = await findUserById(order.sellerId);
  if (!seller?.email) return;
  const locale = await resolveEmailLocale({ userId: seller.id, email: seller.email });
  const english = locale === "en";
  const titleHtml = escapeEmailHtml(order.listingTitle);
  await sendTransactionalEmail({
    type: "order_seller_new",
    to: seller.email,
    userId: seller.id,
    entityId: order.id,
    locale,
    subject: english
      ? `New purchase order — ${order.listingTitle}`
      : `طلب شراء جديد — ${order.listingTitle}`,
    title: english ? "New purchase order" : "طلب شراء جديد",
    bodyHtml: english
      ? `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">You received a new order for “${titleHtml}”. The amount is held in escrow.</p>`
      : `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">وصلك طلب جديد على إعلان «${titleHtml}». المبلغ محجوز في الضمان.</p>`,
    bodyLines: english
      ? [`New order for “${order.listingTitle}”.`, `Order number: ${order.id}`]
      : [`طلب جديد على «${order.listingTitle}».`, `رقم الطلب: ${order.id}`],
    ctaHref: href,
    ctaLabel: english ? "Order details" : "تفاصيل الطلب",
  });
}

export async function emailOrderStatus(input: {
  body: string;
  bodyEn?: string;
  ctaLabel?: string;
  ctaLabelEn?: string;
  entityId: string;
  locale?: AppLocale;
  subject: string;
  subjectEn?: string;
  title: string;
  titleEn?: string;
  to: string;
  type:
    | "order_confirmed"
    | "order_released"
    | "order_refunded"
    | "order_disputed"
    | "seller_proof";
  userId?: string;
}): Promise<void> {
  if (!input.to) return;
  const locale =
    input.locale ??
    (await resolveEmailLocale({ userId: input.userId, email: input.to }));
  const english = locale === "en";
  const subject = english ? input.subjectEn ?? tx("en", input.subject) : input.subject;
  const title = english ? input.titleEn ?? tx("en", input.title) : input.title;
  const body = english ? input.bodyEn ?? tx("en", input.body) : input.body;
  await sendTransactionalEmail({
    type: input.type,
    to: input.to,
    userId: input.userId,
    entityId: input.entityId,
    locale,
    subject,
    title,
    bodyHtml: `<p style="font-size:16px;line-height:1.8;margin:0;">${escapeEmailHtml(body)}</p>`,
    bodyLines: [body],
    ctaHref: emailSiteUrl(`/orders/${input.entityId}`),
    ctaLabel: english
      ? input.ctaLabelEn ?? "Track order"
      : input.ctaLabel ?? "متابعة الطلب",
  });
}

export async function emailOrderStatusToUser(input: {
  body: string;
  bodyEn?: string;
  fallbackEmail?: string;
  orderId: string;
  subject: string;
  subjectEn?: string;
  title: string;
  titleEn?: string;
  type:
    | "order_confirmed"
    | "order_released"
    | "order_refunded"
    | "order_disputed"
    | "seller_proof";
  userId?: string;
}): Promise<void> {
  let email = input.fallbackEmail;
  if (!email && input.userId) {
    email = (await findUserById(input.userId))?.email ?? undefined;
  }
  if (!email) return;
  await emailOrderStatus({
    body: input.body,
    bodyEn: input.bodyEn,
    entityId: input.orderId,
    subject: input.subject,
    subjectEn: input.subjectEn,
    title: input.title,
    titleEn: input.titleEn,
    to: email,
    type: input.type,
    userId: input.userId,
  });
}

export async function emailChatMessage(input: {
  conversationId: string;
  listingTitle: string;
  preview: string;
  recipientUserId: string;
  senderName: string;
}): Promise<void> {
  const recipient = await findUserById(input.recipientUserId);
  if (!recipient?.email) return;
  const locale = await resolveEmailLocale({
    userId: recipient.id,
    email: recipient.email,
  });
  const english = locale === "en";
  await sendTransactionalEmail({
    type: "chat_message",
    to: recipient.email,
    userId: recipient.id,
    entityId: input.conversationId,
    locale,
    dedupeWindowMs: 30 * 60 * 1000,
    subject: english
      ? `New message about “${input.listingTitle}”`
      : `رسالة جديدة حول «${input.listingTitle}»`,
    title: english ? "You have a new message" : "لديك رسالة جديدة",
    bodyHtml: english
      ? `${greet(recipient.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">${escapeEmailHtml(input.senderName)} messaged you about “${escapeEmailHtml(input.listingTitle)}”.</p><p style="font-size:15px;line-height:1.8;margin:12px 0 0;color:#6b6560;">${escapeEmailHtml(input.preview.slice(0, 180))}</p>`
      : `${greet(recipient.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">${escapeEmailHtml(input.senderName)} راسلك بخصوص «${escapeEmailHtml(input.listingTitle)}».</p><p style="font-size:15px;line-height:1.8;margin:12px 0 0;color:#6b6560;">${escapeEmailHtml(input.preview.slice(0, 180))}</p>`,
    bodyLines: english
      ? [
          `${input.senderName} sent a message about “${input.listingTitle}”.`,
          input.preview.slice(0, 180),
        ]
      : [
          `${input.senderName} أرسل رسالة حول «${input.listingTitle}».`,
          input.preview.slice(0, 180),
        ],
    ctaHref: emailSiteUrl(`/chat/${input.conversationId}`),
    ctaLabel: english ? "Open conversation" : "فتح المحادثة",
  });
}

export async function emailPasswordResetLink(input: {
  email: string;
  name?: string;
  token: string;
}): Promise<void> {
  const locale = await resolveEmailLocale({ email: input.email });
  const english = locale === "en";
  const href = `${EMAIL_SITE_URL}/reset-password?token=${encodeURIComponent(input.token)}`;
  const name = input.name || (english ? "Sooqna customer" : "عميل سوقنا");
  await sendTransactionalEmail({
    type: "password_reset",
    to: input.email,
    entityId: input.email,
    locale,
    dedupeWindowMs: 0,
    subject: english
      ? "Reset your password — Sooqna"
      : "إعادة تعيين كلمة المرور — سوقنا",
    title: english
      ? "Secure link to reset your password"
      : "رابط آمن لإعادة تعيين كلمة المرور",
    bodyHtml: english
      ? `${greet(name, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">You asked to reset your password for your Sooqna account.</p><p style="font-size:16px;line-height:1.8;margin:12px 0 0;">Use the button below to choose a new password. The link is valid for <strong>60 minutes</strong> and can be used once.</p><p style="font-size:15px;line-height:1.8;margin:16px 0 0;color:#6b6560;">If you did not request a password reset, ignore this email. We will never ask for your password by email.</p>`
      : `${greet(name, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">طلبت إعادة تعيين كلمة المرور لحسابك في سوقنا.</p><p style="font-size:16px;line-height:1.8;margin:12px 0 0;">اضغط الزر أدناه لاختيار كلمة مرور جديدة. الرابط صالح لمدة <strong>60 دقيقة</strong> ويُستخدم مرة واحدة فقط.</p><p style="font-size:15px;line-height:1.8;margin:16px 0 0;color:#6b6560;">إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة. لن نغيّر حسابك ما لم تفتح الرابط وتعيّن كلمة مرور جديدة. لن نطلب منك كلمة المرور عبر البريد.</p>`,
    bodyLines: english
      ? [
          "You asked to reset your password for your Sooqna account.",
          "The link is valid for 60 minutes and can be used once.",
          "If you did not request this, ignore the email. We will never send your password by email.",
        ]
      : [
          "طلبت إعادة تعيين كلمة المرور لحسابك في سوقنا.",
          "الرابط صالح لمدة 60 دقيقة ويُستخدم مرة واحدة فقط.",
          "إذا لم تطلب ذلك، تجاهل هذه الرسالة. لن نرسل كلمة المرور عبر البريد.",
        ],
    ctaHref: href,
    ctaLabel: english ? "Set a new password" : "تعيين كلمة مرور جديدة",
  });
}
