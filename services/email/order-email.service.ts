import type { Order } from "@/types/domain/order";
import { loadCollection, saveCollection } from "@/services/payments/data-store";
import { deliverEmailSafely } from "@/services/email/email.service";

const PENDING_EMAILS_FILE = "pending-emails.json";

export type PendingEmailEvent = {
  id: string;
  type:
    | "order_confirmation"
    | "seller_order_notification"
    | "password_reset"
    | "account_setup";
  to: string;
  orderId?: string;
  payload: Record<string, string>;
  createdAt: string;
  status: "pending" | "sent" | "failed";
};

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

function buildOrderConfirmationHtml(input: {
  name: string;
  orderNumber: string;
  orderTrackingLink: string;
  setPasswordLink?: string;
  hasExistingAccount: boolean;
}): string {
  const accountSection = input.setPasswordLink
    ? `<p style="font-size:16px;line-height:1.8;">أنشأنا لك ملفًا مبسطًا باستخدام بريدك الإلكتروني لتسهيل متابعة الطلب.</p>
       <p style="font-size:16px;line-height:1.8;">لإنشاء كلمة مرور والوصول إلى حسابك لاحقًا:</p>
       <p style="text-align:center;margin:20px 0;"><a href="${input.setPasswordLink}" style="background:#0B1628;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">إعداد الحساب</a></p>
       <p style="font-size:14px;line-height:1.8;color:#555;">إذا لم ترغب بإنشاء كلمة مرور الآن، سيبقى طلبك محفوظًا ويمكنك الرجوع إليه من رابط الطلب الآمن.</p>`
    : input.hasExistingAccount
      ? `<p style="font-size:16px;line-height:1.8;">لديك حساب سابق بهذا البريد. يمكنك تسجيل الدخول لمتابعة جميع طلباتك.</p>`
      : "";

  return `
    <div style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#FAF9F7;color:#0B1628;direction:rtl;text-align:right;">
      <div style="text-align:center;margin-bottom:24px;">
        <strong style="font-size:22px;color:#0B1628;">سوقنا Sooqna</strong>
      </div>
      <p style="font-size:16px;line-height:1.8;">مرحبًا ${input.name}،</p>
      <p style="font-size:16px;line-height:1.8;">تم استلام طلبك بنجاح.</p>
      <p style="font-size:16px;line-height:1.8;">رقم الطلب:<br/><strong>${input.orderNumber}</strong></p>
      <p style="font-size:16px;line-height:1.8;">يمكنك متابعة حالة الطلب من خلال الرابط التالي:</p>
      <p style="text-align:center;margin:20px 0;"><a href="${input.orderTrackingLink}" style="background:#0B1628;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">متابعة الطلب</a></p>
      ${accountSection}
      <p style="font-size:14px;margin-top:32px;color:#555;">فريق سوقنا</p>
    </div>
  `.trim();
}

function buildOrderConfirmationText(input: {
  name: string;
  orderNumber: string;
  orderTrackingLink: string;
  setPasswordLink?: string;
  hasExistingAccount: boolean;
}): string {
  const lines = [
    `مرحبًا ${input.name}،`,
    "",
    "تم استلام طلبك بنجاح.",
    "",
    `رقم الطلب: ${input.orderNumber}`,
    "",
    "يمكنك متابعة حالة الطلب من خلال الرابط التالي:",
    input.orderTrackingLink,
  ];

  if (input.setPasswordLink) {
    lines.push(
      "",
      "أنشأنا لك ملفًا مبسطًا باستخدام بريدك الإلكتروني لتسهيل متابعة الطلب.",
      "",
      "لإنشاء كلمة مرور والوصول إلى حسابك لاحقًا:",
      input.setPasswordLink,
      "",
      "إذا لم ترغب بإنشاء كلمة مرور الآن، سيبقى طلبك محفوظًا ويمكنك الرجوع إليه من رابط الطلب الآمن.",
    );
  } else if (input.hasExistingAccount) {
    lines.push(
      "",
      "لديك حساب سابق بهذا البريد. يمكنك تسجيل الدخول لمتابعة جميع طلباتك.",
    );
  }

  lines.push("", "فريق سوقنا");
  return lines.join("\n");
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
  const baseUrl = getAppBaseUrl();
  const orderTrackingLink = `${baseUrl}/order-status?token=${input.guestAccessToken}`;
  const setPasswordLink = input.accountSetupToken
    ? `${baseUrl}/complete-account?token=${input.accountSetupToken}`
    : undefined;

  const emailPayload = {
    to: input.order.buyerEmail,
    subject: "تم استلام طلبك في سوقنا",
    html: buildOrderConfirmationHtml({
      name: input.order.buyerName,
      orderNumber: input.order.id,
      orderTrackingLink,
      setPasswordLink,
      hasExistingAccount: input.hasExistingAccount,
    }),
    text: buildOrderConfirmationText({
      name: input.order.buyerName,
      orderNumber: input.order.id,
      orderTrackingLink,
      setPasswordLink,
      hasExistingAccount: input.hasExistingAccount,
    }),
  };

  const sent = await deliverEmailSafely(emailPayload);
  const { updateOrder } = await import("@/services/payments/order-store");
  await updateOrder(input.order.id, {
    emailDeliveryStatus: sent ? "sent" : "pending",
  });

  if (!sent) {
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
}

async function queueSellerOrderNotification(order: Order): Promise<void> {
  const { findUserById } = await import("@/services/auth/user-store");
  const seller = await findUserById(order.sellerId);
  if (!seller?.email) return;

  const emailPayload = {
    to: seller.email,
    subject: `طلب جديد — ${order.listingTitle}`,
    html: `<p style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;">تم استلام طلب جديد لإعلان «${order.listingTitle}».<br/>رقم الطلب: ${order.id}</p>`,
    text: `تم استلام طلب جديد لإعلان «${order.listingTitle}».\nرقم الطلب: ${order.id}`,
  };

  const sent = await deliverEmailSafely(emailPayload);
  if (!sent) {
    await queuePendingEmail({
      type: "seller_order_notification",
      to: seller.email,
      orderId: order.id,
      payload: { listingTitle: order.listingTitle },
    });
  }
}

export async function sendPasswordResetLinkEmail(input: {
  email: string;
  name: string;
  resetLink: string;
}): Promise<boolean> {
  const emailPayload = {
    to: input.email,
    subject: "إعادة تعيين كلمة المرور — سوقنا",
    html: `
      <div style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#FAF9F7;color:#0B1628;direction:rtl;text-align:right;">
        <p style="font-size:16px;line-height:1.8;">مرحبًا ${input.name}،</p>
        <p style="font-size:16px;line-height:1.8;">تلقينا طلبًا لإعادة تعيين كلمة المرور.</p>
        <p style="text-align:center;margin:20px 0;"><a href="${input.resetLink}" style="background:#0B1628;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">إعادة تعيين كلمة المرور</a></p>
        <p style="font-size:14px;line-height:1.8;color:#555;">ينتهي الرابط خلال 45 دقيقة. إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
        <p style="font-size:14px;margin-top:32px;color:#555;">فريق سوقنا</p>
      </div>
    `.trim(),
    text: [
      `مرحبًا ${input.name}،`,
      "",
      "تلقينا طلبًا لإعادة تعيين كلمة المرور.",
      input.resetLink,
      "",
      "ينتهي الرابط خلال 45 دقيقة.",
      "",
      "فريق سوقنا",
    ].join("\n"),
  };

  const sent = await deliverEmailSafely(emailPayload);
  if (!sent) {
    await queuePendingEmail({
      type: "password_reset",
      to: input.email,
      payload: { resetLink: input.resetLink },
    });
  }
  return sent;
}
