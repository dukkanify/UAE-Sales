import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { getAllUsers } from "@/services/auth/user-store";
import {
  approveRegisteredUser,
  markPersonVerified,
} from "@/services/auth/user-store";
import { createNotification } from "@/services/payments/notification-store";
import type { UserProfile } from "@/types";

export async function completePersonVerification(
  userId: string,
): Promise<{ approved: boolean; user: UserProfile }> {
  const verified = await markPersonVerified(userId);
  const settings = await getAdminSettings();
  const autoApprove = settings.autoApproveUsers !== false;

  if (autoApprove) {
    const user = await approveRegisteredUser(userId);
    await notifyUserApproved(user);
    return { approved: true, user };
  }

  await createNotification({
    userId: verified.id,
    type: "account_verified",
    title: "تم التحقق من حسابك",
    body: "تحققنا من بريدك. حسابك بانتظار اعتماد سريع من الإدارة.",
    href: "/register/pending",
  });
  await notifyAdminsPendingApproval(verified);
  return { approved: false, user: verified };
}

export async function approvePendingUser(userId: string): Promise<UserProfile> {
  const user = await approveRegisteredUser(userId);
  await notifyUserApproved(user);
  return user;
}

async function notifyUserApproved(user: UserProfile): Promise<void> {
  await createNotification({
    userId: user.id,
    type: "account_approved",
    title: "تم اعتماد حسابك",
    body: "حسابك في سوقنا نشط الآن. يمكنك البيع والشراء بثقة.",
    href: "/profile",
  });
}

async function notifyAdminsPendingApproval(user: UserProfile): Promise<void> {
  const admins = (await getAllUsers()).filter((item) => item.role === "admin");
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: "account_verified",
        title: "حساب بانتظار الاعتماد",
        body: `تم التحقق من ${user.fullName} (${user.email}). اعتمد الحساب بضغطة واحدة.`,
        href: "/admin/users",
      }),
    ),
  );
}
