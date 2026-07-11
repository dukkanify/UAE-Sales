import type { Order } from "@/types/domain/order";
import {
  createProvisionalGuestAccount,
  emailHasActiveAccount,
  normalizeEmail,
} from "@/services/auth/guest-account.service";
import {
  createAccountSetupToken,
  createGuestOrderAccessToken,
} from "@/services/auth/token.service";
import { findUserByEmail } from "@/services/auth/user-store";
import { queueOrderConfirmationEmail } from "@/services/email/order-email.service";
import { createAddress } from "@/services/addresses/address-store";
import { updateOrder } from "@/services/payments/order-store";
import type { DeliveryAddress } from "@/types/domain/address";

export type PostPaymentGuestResult = {
  order: Order;
  guestAccessToken?: string;
  accountSetupToken?: string;
  isNewAccount: boolean;
  hasExistingAccount: boolean;
};

export async function finalizeGuestCheckoutAfterPayment(
  order: Order,
  options?: {
    saveAddress?: boolean;
    deliveryAddress?: Partial<DeliveryAddress>;
  },
): Promise<PostPaymentGuestResult> {
  if (order.guestAccessTokenHash) {
    return {
      order,
      isNewAccount: false,
      hasExistingAccount: Boolean(order.hasExistingAccount),
    };
  }

  const guestEmail = normalizeEmail(order.guestEmail ?? order.buyerEmail);
  const guestFullName = order.guestFullName ?? order.buyerName;
  const guestPhone = order.guestPhone ?? "";

  const existingUser = await findUserByEmail(guestEmail);
  const hasExistingAccount = await emailHasActiveAccount(guestEmail);
  let buyerId = existingUser?.id;
  let isNewAccount = false;
  let accountSetupToken: string | undefined;

  if (!buyerId) {
    const created = await createProvisionalGuestAccount({
      email: guestEmail,
      fullName: guestFullName,
      phone: guestPhone,
    });
    buyerId = created.id;
    isNewAccount = true;
    accountSetupToken = await createAccountSetupToken({
      userId: created.id,
      email: guestEmail,
    });
  }

  if (
    options?.saveAddress &&
    options.deliveryAddress &&
    buyerId &&
    options.deliveryAddress.emirate
  ) {
    await createAddress({
      userId: buyerId,
      label: options.deliveryAddress.label ?? "المنزل",
      fullName: options.deliveryAddress.fullName ?? guestFullName,
      phone: options.deliveryAddress.phone ?? guestPhone,
      emirate: options.deliveryAddress.emirate,
      city: options.deliveryAddress.city ?? "",
      area: options.deliveryAddress.area ?? "",
      street: options.deliveryAddress.street ?? "",
      building: options.deliveryAddress.building,
      unit: options.deliveryAddress.unit,
      landmark: options.deliveryAddress.landmark,
      notes: options.deliveryAddress.notes,
      isDefault: true,
    });
  }

  const guestAccess = createGuestOrderAccessToken();
  const customerType = hasExistingAccount
    ? "guest"
    : isNewAccount
      ? "guest"
      : "registered";

  const updated = await updateOrder(
    order.id,
    {
      buyerId,
      buyerEmail: guestEmail,
      buyerName: guestFullName,
      customerType: hasExistingAccount && !isNewAccount ? "registered" : customerType,
      hasExistingAccount,
      guestAccessTokenHash: guestAccess.tokenHash,
      guestAccessExpiresAt: guestAccess.expiresAt,
      accountSetupEmailSent: Boolean(accountSetupToken),
    },
    {
      type: "guest_checkout_finalized",
      message: hasExistingAccount
        ? "تم ربط الطلب بحساب موجود"
        : "تم إنشاء حساب ضيف وربط الطلب",
      metadata: { buyerId: buyerId ?? "", isNewAccount: String(isNewAccount) },
    },
  );

  const finalOrder = updated ?? order;

  await queueOrderConfirmationEmail({
    order: finalOrder,
    guestAccessToken: guestAccess.rawToken,
    accountSetupToken,
    isNewAccount,
    hasExistingAccount,
  });

  return {
    order: finalOrder,
    guestAccessToken: guestAccess.rawToken,
    accountSetupToken,
    isNewAccount,
    hasExistingAccount,
  };
}
