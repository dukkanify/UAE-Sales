import { notifyWelcome } from "@/services/notifications/notification-events";

/** Sends the welcome email and records an in-app notification after signup. */
export async function completeRegistrationWelcome(input: {
  email: string;
  name: string;
  userId: string;
}): Promise<{ emailed: boolean }> {
  try {
    const result = await notifyWelcome(input);
    return { emailed: result.emailStatus === "sent" };
  } catch (error) {
    console.error("[Sooqna Welcome] notification failed", error);
    return { emailed: false };
  }
}
