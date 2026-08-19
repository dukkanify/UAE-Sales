import { findUserById } from "@/services/auth/user-store";
import { sendTransactionalEmail } from "@/services/email/transactional-email";
import {
  EMAIL_SITE_URL,
  emailSiteUrl,
  escapeEmailHtml,
} from "@/services/email/sooqna-email-template";
import type { Listing } from "@/types";
import type { Order } from "@/types/domain/order";

function greet(name: string): string {
  const safe = escapeEmailHtml(name.trim() || "عميل سوقنا");
  return `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">مرحبًا ${safe}،</p>`;
}

export async function emailListingReceived(listing: Listing): Promise<void> {
  const seller = await findUserById(listing.seller.id);
  if (!seller?.email) return;
  const href = emailSiteUrl(`/listings/${listing.slug}`);
  await sendTransactionalEmail({
    type: "listing_received",
    to: seller.email,
    userId: seller.id,
    entityId: listing.id,
    dedupeWindowMs: 10 * 60 * 1000,
    subject: `تم استلام إعلانك — ${listing.title}`,
    title: "إعلانك قيد المراجعة",
    bodyHtml: `${greet(seller.fullName)}<p style="font-size:16px;line-height:1.8;margin:0;">استلمنا إعلان «${escapeEmailHtml(listing.title)}» وهو الآن قيد مراجعة فريق سوقنا. سنراسلك فور الموافقة أو إذا احتجنا تعديلاً.</p>`,
    bodyLines: [`استلمنا إعلان «${listing.title}» وهو قيد المراجعة.`],
    ctaHref: href,
    ctaLabel: "متابعة الإعلان",
  });
}

export async function emailListingApproved(listing: Listing): Promise<void> {
  const seller = await findUserById(listing.seller.id);
  if (!seller?.email) return;
  const href = emailSiteUrl(`/listings/${listing.slug}`);
  await sendTransactionalEmail({
    type: "listing_approved",
    to: seller.email,
    userId: seller.id,
    entityId: listing.id,
    subject: `تمت الموافقة على إعلانك — ${listing.title}`,
    title: "إعلانك منشور الآن",
    bodyHtml: `${greet(seller.fullName)}<p style="font-size:16px;line-height:1.8;margin:0;">تمت الموافقة على إعلان «${escapeEmailHtml(listing.title)}» وأصبح ظاهرًا للمشترين على سوقنا.</p>`,
    bodyLines: [`تمت الموافقة على إعلان «${listing.title}».`],
    ctaHref: href,
    ctaLabel: "عرض الإعلان",
  });
}

export async function emailListingRejected(
  listing: Listing,
  reason?: string,
): Promise<void> {
  const seller = await findUserById(listing.seller.id);
  if (!seller?.email) return;
  const reasonHtml = reason
    ? `<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">السبب: ${escapeEmailHtml(reason)}</p>`
    : "";
  await sendTransactionalEmail({
    type: "listing_rejected",
    to: seller.email,
    userId: seller.id,
    entityId: listing.id,
    subject: `يحتاج إعلانك إلى تعديل — ${listing.title}`,
    title: "لم نتمكن من نشر الإعلان",
    bodyHtml: `${greet(seller.fullName)}<p style="font-size:16px;line-height:1.8;margin:0;">لم تتم الموافقة على إعلان «${escapeEmailHtml(listing.title)}» بوضعه الحالي. يمكنك تعديله وإعادة الإرسال.</p>${reasonHtml}`,
    bodyLines: [
      `لم تتم الموافقة على إعلان «${listing.title}».`,
      reason ? `السبب: ${reason}` : "عدّل الإعلان ثم أعد إرساله.",
    ],
    ctaHref: emailSiteUrl(`/listings/${listing.slug}/edit`),
    ctaLabel: "تعديل الإعلان",
  });
}

export async function emailListingFeaturedPaid(listing: Listing): Promise<void> {
  const seller = await findUserById(listing.seller.id);
  if (!seller?.email) return;
  const href = emailSiteUrl(`/listings/${listing.slug}`);
  await sendTransactionalEmail({
    type: "featured_paid",
    to: seller.email,
    userId: seller.id,
    entityId: listing.id,
    subject: `تم تمييز إعلانك — ${listing.title}`,
    title: "تم دفع باقة التمييز",
    bodyHtml: `${greet(seller.fullName)}<p style="font-size:16px;line-height:1.8;margin:0;">تم تأكيد دفع تمييز إعلان «${escapeEmailHtml(listing.title)}». سيظهر في الأقسام المميزة حسب مدة الباقة.</p>`,
    bodyLines: [`تم تأكيد دفع تمييز إعلان «${listing.title}».`],
    ctaHref: href,
    ctaLabel: "عرض الإعلان",
  });
}

export async function emailOrderPaid(order: Order): Promise<void> {
  const href = emailSiteUrl(`/orders/${order.id}`);
  if (order.buyerEmail) {
    await sendTransactionalEmail({
      type: "order_paid",
      to: order.buyerEmail,
      userId: order.buyerId ?? undefined,
      entityId: order.id,
      subject: `تم الدفع بنجاح — طلب ${order.id}`,
      title: "تم استلام الدفع",
      bodyHtml: `${greet(order.buyerName)}<p style="font-size:16px;line-height:1.8;margin:0;">تم دفع طلب «${escapeEmailHtml(order.listingTitle)}» بنجاح. المبلغ محجوز في الضمان حتى تأكيد الاستلام.</p>`,
      bodyLines: [`تم دفع طلب «${order.listingTitle}».`, `رقم الطلب: ${order.id}`],
      ctaHref: href,
      ctaLabel: "متابعة الطلب",
    });
  }

  const seller = await findUserById(order.sellerId);
  if (!seller?.email) return;
  await sendTransactionalEmail({
    type: "order_seller_new",
    to: seller.email,
    userId: seller.id,
    entityId: order.id,
    subject: `طلب شراء جديد — ${order.listingTitle}`,
    title: "طلب شراء جديد",
    bodyHtml: `${greet(seller.fullName)}<p style="font-size:16px;line-height:1.8;margin:0;">وصلك طلب جديد على إعلان «${escapeEmailHtml(order.listingTitle)}». المبلغ محجوز في الضمان.</p>`,
    bodyLines: [`طلب جديد على «${order.listingTitle}».`, `رقم الطلب: ${order.id}`],
    ctaHref: href,
    ctaLabel: "تفاصيل الطلب",
  });
}

export async function emailOrderStatus(input: {
  body: string;
  ctaLabel?: string;
  entityId: string;
  subject: string;
  title: string;
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
  await sendTransactionalEmail({
    type: input.type,
    to: input.to,
    userId: input.userId,
    entityId: input.entityId,
    subject: input.subject,
    title: input.title,
    bodyHtml: `<p style="font-size:16px;line-height:1.8;margin:0;">${escapeEmailHtml(input.body)}</p>`,
    bodyLines: [input.body],
    ctaHref: emailSiteUrl(`/orders/${input.entityId}`),
    ctaLabel: input.ctaLabel ?? "متابعة الطلب",
  });
}

export async function emailOrderStatusToUser(input: {
  body: string;
  fallbackEmail?: string;
  orderId: string;
  subject: string;
  title: string;
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
    entityId: input.orderId,
    subject: input.subject,
    title: input.title,
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
  await sendTransactionalEmail({
    type: "chat_message",
    to: recipient.email,
    userId: recipient.id,
    entityId: input.conversationId,
    dedupeWindowMs: 30 * 60 * 1000,
    subject: `رسالة جديدة حول «${input.listingTitle}»`,
    title: "لديك رسالة جديدة",
    bodyHtml: `${greet(recipient.fullName)}<p style="font-size:16px;line-height:1.8;margin:0;">${escapeEmailHtml(input.senderName)} راسلك بخصوص «${escapeEmailHtml(input.listingTitle)}».</p><p style="font-size:15px;line-height:1.8;margin:12px 0 0;color:#6b6560;">${escapeEmailHtml(input.preview.slice(0, 180))}</p>`,
    bodyLines: [
      `${input.senderName} أرسل رسالة حول «${input.listingTitle}».`,
      input.preview.slice(0, 180),
    ],
    ctaHref: emailSiteUrl(`/chat/${input.conversationId}`),
    ctaLabel: "فتح المحادثة",
  });
}

export async function emailPasswordResetLink(input: {
  email: string;
  name?: string;
  token: string;
}): Promise<void> {
  const href = `${EMAIL_SITE_URL}/forgot-password?step=password&email=${encodeURIComponent(input.email)}&token=${encodeURIComponent(input.token)}`;
  await sendTransactionalEmail({
    type: "password_reset",
    to: input.email,
    entityId: input.email,
    dedupeWindowMs: 2 * 60 * 1000,
    subject: "إعادة تعيين كلمة المرور — سوقنا",
    title: "رابط آمن لإعادة تعيين كلمة المرور",
    bodyHtml: `${greet(input.name || "عميل سوقنا")}<p style="font-size:16px;line-height:1.8;margin:0;">طلبت إعادة تعيين كلمة المرور. الرابط صالح لمدة ساعة واحدة. إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>`,
    bodyLines: [
      "استخدم الرابط التالي لإعادة تعيين كلمة المرور. صالح لمدة ساعة.",
      "إذا لم تطلب ذلك، تجاهل الرسالة.",
    ],
    ctaHref: href,
    ctaLabel: "تعيين كلمة مرور جديدة",
  });
}
