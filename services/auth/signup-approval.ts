import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { approveRegisteredUser, markPersonVerified } from "@/services/auth/user-store";
import { completeRegistrationWelcome } from "@/services/auth/welcome";
import { notify, notifyAdmins } from "@/services/notifications/notification.service";
import type { UserProfile } from "@/types";

export async function completePersonVerification(
  userId: string,
): Promise<{ approved: boolean; user: UserProfile }> {
  const verified = await markPersonVerified(userId);
  const settings = await getAdminSettings();
  const autoApprove = settings.autoApproveUsers !== false;

  if (autoApprove) {
    const user = await approveRegisteredUser(userId);
    await completeRegistrationWelcome({
      userId: user.id,
      email: user.email,
      name: user.fullName,
    });
    return { approved: true, user };
  }

  try {
    await notify({
      userId: verified.id,
      type: "account_verified",
      title: "تم التحقق من حسابك",
      titleEn: "Your account was verified",
      body: "تحققنا من بريدك. حسابك بانتظار اعتماد سريع من الإدارة.",
      bodyEn: "Your email is verified. An admin will approve your account shortly.",
      href: "/register/pending",
      idempotencyKey: `ACCOUNT_VERIFIED:${verified.id}`,
      critical: true,
    });
    await notifyAdminsPendingApproval(verified);
  } catch (error) {
    console.error("[Sooqna Signup] pending notifications failed", error);
  }

  return { approved: false, user: verified };
}

export async function approvePendingUser(userId: string): Promise<UserProfile> {
  const user = await approveRegisteredUser(userId);
  await completeRegistrationWelcome({
    userId: user.id,
    email: user.email,
    name: user.fullName,
  });
  return user;
}

async function notifyAdminsPendingApproval(user: UserProfile): Promise<void> {
  await notifyAdmins({
    type: "account_pending_approval",
    title: "حساب بانتظار الاعتماد",
    titleEn: "Account awaiting approval",
    body: `تم التحقق من ${user.fullName} (${user.email}). اعتمد الحساب بضغطة واحدة.`,
    bodyEn: `${user.fullName} (${user.email}) is verified and waiting for approval.`,
    href: "/admin/users",
    idempotencyKey: `ADMIN_PENDING_USER:${user.id}`,
    channels: ["in_app"],
  });
}
