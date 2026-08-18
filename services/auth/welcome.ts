import { sendWelcomeEmail } from "@/services/email/email.service";
import { createNotification } from "@/services/payments/notification-store";

/** Sends the welcome email and records an in-app notification after signup. */
export async function completeRegistrationWelcome(input: {
  email: string;
  name: string;
  userId: string;
}): Promise<{ emailed: boolean }> {
  const name = input.name.trim() || "عميل سوقنا";
  const emailed = await sendWelcomeEmail({
    email: input.email,
    name,
  });

  try {
    await createNotification({
      userId: input.userId,
      type: "welcome",
      title: "أهلاً بك في سوقنا",
      body: `مرحباً ${name}، حسابك في سوقنا نشط الآن. ابدأ بنشر إعلان أو تصفّح العروض.`,
      href: "/search",
    });
  } catch (error) {
    console.error("[Sooqna Welcome] in-app notification failed", error);
  }

  return { emailed };
}
