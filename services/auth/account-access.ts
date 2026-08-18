import type { AccountStatus, UserProfile } from "@/types/domain/user";

export function isMarketplaceAccountReady(
  user?: { accountStatus?: AccountStatus } | null,
): boolean {
  if (!user) return false;
  return user.accountStatus !== "pending" && user.accountStatus !== "suspended";
}

export function getAccountGatePath(user: Pick<UserProfile, "email" | "emailVerifiedAt" | "accountStatus">): string {
  if (user.accountStatus === "pending") {
    if (!user.emailVerifiedAt) {
      const params = new URLSearchParams({
        email: user.email,
        purpose: "REGISTER",
      });
      return `/verify-email?${params.toString()}`;
    }
    return "/register/pending";
  }

  if (user.accountStatus === "suspended") {
    return "/profile";
  }

  return "/profile";
}

export type VerifyAccountPrompt = {
  actionLabel: string;
  href: string;
  message: string;
  shortMessage: string;
};

const HIDDEN_PATH_PREFIXES = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/complete-account",
  "/admin",
];

export function getVerifyAccountPrompt(
  user: UserProfile | null | undefined,
  pathname: string,
): VerifyAccountPrompt | null {
  if (HIDDEN_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  if (!user) {
    return {
      message:
        "انضم إلينا في بناء مجتمع أكثر أماناً. وثّق حسابك لتعزيز مصداقيتك ومساعدتنا في خلق الثقة بين مستخدمي سوقنا.",
      shortMessage: "وثّق حسابك لتعزيز الثقة في سوقنا.",
      actionLabel: "وثّق حسابك",
      href: "/register",
    };
  }

  if (user.accountStatus === "suspended") {
    return null;
  }

  if (user.accountStatus === "pending" && !user.emailVerifiedAt) {
    return {
      message: "أكمل التحقق من بريدك أولاً. بعد التحقق من الشخص يُعتمد حسابك بسهولة.",
      shortMessage: "أكمل التحقق من بريدك لتوثيق حسابك.",
      actionLabel: "أكمل التحقق",
      href: getAccountGatePath(user),
    };
  }

  if (user.accountStatus === "pending") {
    return {
      message: "تم التحقق منك. حسابك بانتظار اعتماد سريع من الإدارة لتعزيز الثقة في السوق.",
      shortMessage: "تم التحقق منك. حسابك بانتظار الاعتماد.",
      actionLabel: "متابعة الحالة",
      href: "/register/pending",
    };
  }

  if (!user.isVerified) {
    return {
      message:
        "وثّق حسابك لتعزيز مصداقيتك ومساعدتنا في خلق الثقة بين مستخدمي سوقنا.",
      shortMessage: "وثّق حسابك لتعزيز مصداقيتك في سوقنا.",
      actionLabel: "وثّق حسابك",
      href: "/profile",
    };
  }

  return null;
}

