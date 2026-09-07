import type { Order } from "@/types/domain/order";
import { findUserById } from "@/services/auth/user-store";
import { sendTransactionalEmail } from "@/services/email/transactional-email";
import {
  EMAIL_SITE_URL,
  emailSiteUrl,
  escapeEmailHtml,
} from "@/services/email/sooqna-email-template";
import { resolveEmailLocale } from "@/shared/i18n/email-locale";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const PENDING_EMAILS_FILE = "pending-emails.json";

export type PendingEmailEvent = {
  id: string;
  type: "order_confirmation" | "seller_order_notification";
  to: string;
  orderId: string;
  payload: Record<string, string>;
  createdAt: string;
  status: "pending" | "sent" | "failed";
};

function greet(name: string, locale: "ar" | "en"): string {
  const fallback = locale === "en" ? "Sooqna customer" : "عميل سوقنا";
  const safe = escapeEmailHtml(name.trim() || fallback);
  if (locale === "en") {
    return `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">Hello ${safe},</p>`;
  }
  return `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">مرحبًا ${safe}،</p>`;
}

async function queuePendingEmail(event: Omit<PendingEmailEvent, "id" | "createdAt" | "status">) {
  const events = await loadCollection<PendingEmailEvent>(PENDING_EMAILS_FILE);
  events.unshift({
    ...event,
    id: `email-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  });
  await saveCollection(PENDING_EMAILS_FILE, events);
}

export async function queueOrderConfirmationEmail(input: {
  order: Order;
  guestAccessToken: string;
  accountSetupToken?: string;
  isNewAccount: boolean;
  hasExistingAccount: boolean;
}): Promise<void> {
  try {
    const orderTrackingLink = `${EMAIL_SITE_URL}/order-status?token=${encodeURIComponent(input.guestAccessToken)}`;
    const setPasswordLink = input.accountSetupToken
      ? `${EMAIL_SITE_URL}/complete-account?token=${encodeURIComponent(input.accountSetupToken)}`
      : undefined;

    const locale = await resolveEmailLocale({
      userId: input.order.buyerId,
      email: input.order.buyerEmail,
    });
    const english = locale === "en";

    let extraHtml = "";
    const extraLines: string[] = [];
    if (setPasswordLink) {
      extraHtml = english
        ? `<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">We created a simple account with your email so you can track the order. You can set a password later from the link below.</p>
        <p style="text-align:center;margin:20px 0 8px;"><a href="${setPasswordLink}" style="display:inline-block;padding:12px 22px;background:#C9A227;color:#0B1628;text-decoration:none;border-radius:12px;font-weight:700;">Set up account</a></p>`
        : `<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">أنشأنا لك ملفًا مبسطًا باستخدام بريدك لتسهيل متابعة الطلب. يمكنك إعداد كلمة المرور لاحقًا من الرابط أدناه.</p>
        <p style="text-align:center;margin:20px 0 8px;"><a href="${setPasswordLink}" style="display:inline-block;padding:12px 22px;background:#C9A227;color:#0B1628;text-decoration:none;border-radius:12px;font-weight:700;">إعداد الحساب</a></p>`;
      extraLines.push(
        ...(english
          ? ["You can set your password from:", setPasswordLink]
          : ["يمكنك إعداد كلمة المرور من:", setPasswordLink]),
      );
    } else if (input.hasExistingAccount) {
      extraHtml = english
        ? `<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">You already have an account with this email. Sign in to track all of your orders.</p>`
        : `<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">لديك حساب سابق بهذا البريد. سجّل الدخول لمتابعة جميع طلباتك.</p>`;
      extraLines.push(
        english
          ? "You already have an account with this email. Sign in to track your orders."
          : "لديك حساب سابق بهذا البريد. سجّل الدخول لمتابعة طلباتك.",
      );
    }

    const titleHtml = escapeEmailHtml(input.order.listingTitle);
    const buyerStatus = await sendTransactionalEmail({
      type: "order_paid",
      to: input.order.buyerEmail,
      userId: input.order.buyerId ?? undefined,
      entityId: input.order.id,
      locale,
      subject: english
        ? `We received your order — ${input.order.listingTitle}`
        : `تم استلام طلبك — ${input.order.listingTitle}`,
      title: english ? "Your order has been received" : "تم استلام طلبك بنجاح",
      bodyHtml: english
        ? `${greet(input.order.buyerName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">Payment for “${titleHtml}” succeeded. The amount is held in escrow until receipt is confirmed.</p><p style="font-size:16px;line-height:1.8;margin:12px 0 0;">Order number: <strong>${escapeEmailHtml(input.order.id)}</strong></p>${extraHtml}`
        : `${greet(input.order.buyerName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">تم دفع طلب «${titleHtml}» بنجاح. المبلغ محجوز في الضمان حتى تأكيد الاستلام.</p><p style="font-size:16px;line-height:1.8;margin:12px 0 0;">رقم الطلب: <strong>${escapeEmailHtml(input.order.id)}</strong></p>${extraHtml}`,
      bodyLines: english
        ? [
            `Payment for “${input.order.listingTitle}” was received.`,
            `Order number: ${input.order.id}`,
            ...extraLines,
          ]
        : [
            `تم دفع طلب «${input.order.listingTitle}».`,
            `رقم الطلب: ${input.order.id}`,
            ...extraLines,
          ],
      ctaHref: orderTrackingLink,
      ctaLabel: english ? "Track order" : "متابعة الطلب",
    });

    const { updateOrder } = await import("@/services/payments/order-store");
    await updateOrder(input.order.id, {
      emailDeliveryStatus: buyerStatus === "failed" ? "failed" : buyerStatus,
    });

    if (buyerStatus === "failed") {
      await queuePendingEmail({
        type: "order_confirmation",
        to: input.order.buyerEmail,
        orderId: input.order.id,
        payload: {
          orderTrackingLink,
          setPasswordLink: setPasswordLink ?? "",
        },
      });
    }

    await queueSellerOrderNotification(input.order);
  } catch (error) {
    console.error("[Sooqna Email] guest order confirmation failed", error);
  }
}

async function queueSellerOrderNotification(order: Order): Promise<void> {
  const seller = await findUserById(order.sellerId);
  if (!seller?.email) return;

  const locale = await resolveEmailLocale({ userId: seller.id, email: seller.email });
  const english = locale === "en";
  const titleHtml = escapeEmailHtml(order.listingTitle);

  const status = await sendTransactionalEmail({
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
      ? `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">You received a new order for “${titleHtml}”. The amount is held in escrow.</p><p style="font-size:16px;line-height:1.8;margin:12px 0 0;">Order number: <strong>${escapeEmailHtml(order.id)}</strong></p>`
      : `${greet(seller.fullName, locale)}<p style="font-size:16px;line-height:1.8;margin:0;">وصلك طلب جديد على إعلان «${titleHtml}». المبلغ محجوز في الضمان.</p><p style="font-size:16px;line-height:1.8;margin:12px 0 0;">رقم الطلب: <strong>${escapeEmailHtml(order.id)}</strong></p>`,
    bodyLines: english
      ? [`New order for “${order.listingTitle}”.`, `Order number: ${order.id}`]
      : [`طلب جديد على «${order.listingTitle}».`, `رقم الطلب: ${order.id}`],
    ctaHref: emailSiteUrl(`/orders/${order.id}`),
    ctaLabel: english ? "Order details" : "تفاصيل الطلب",
  });

  if (status === "failed") {
    await queuePendingEmail({
      type: "seller_order_notification",
      to: seller.email,
      orderId: order.id,
      payload: { listingTitle: order.listingTitle },
    });
  }
}
