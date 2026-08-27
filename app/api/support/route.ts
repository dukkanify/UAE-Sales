import { NextResponse } from "next/server";
import { z } from "zod";
import { BRAND } from "@/shared/constants/brand";
import { deliverEmailSafely } from "@/services/email/email.service";
import { checkRateLimit, getClientIp } from "@/services/auth/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2, "NAME_TOO_SHORT").max(80, "NAME_TOO_LONG"),
  email: z.string().trim().email("EMAIL_INVALID"),
  topic: z.enum(["order", "listing", "escrow", "account", "other"], {
    message: "TOPIC_INVALID",
  }),
  message: z
    .string()
    .trim()
    .min(10, "MESSAGE_TOO_SHORT")
    .max(2000, "MESSAGE_TOO_LONG"),
});

const topicLabels: Record<z.infer<typeof schema>["topic"], string> = {
  order: "طلب / دفع",
  listing: "إعلان",
  escrow: "ضمان مالي",
  account: "حساب",
  other: "أخرى",
};

const fieldMessages: Record<string, string> = {
  NAME_TOO_SHORT: "الاسم يجب أن يكون حرفين على الأقل.",
  NAME_TOO_LONG: "الاسم طويل جداً.",
  EMAIL_INVALID: "البريد الإلكتروني غير صالح.",
  TOPIC_INVALID: "اختر موضوعاً صالحاً.",
  MESSAGE_TOO_SHORT: "الرسالة يجب أن تكون 10 أحرف على الأقل.",
  MESSAGE_TOO_LONG: "الرسالة طويلة جداً.",
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`support:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "محاولات كثيرة. حاول بعد قليل." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      const code = issue.message;
      if (!fieldErrors[key]) {
        fieldErrors[key] = fieldMessages[code] ?? issue.message;
      }
    }
    return NextResponse.json(
      {
        error: "INVALID_INPUT",
        message: "أكمل الحقول المطلوبة بشكل صحيح.",
        fieldErrors,
      },
      { status: 400 },
    );
  }

  const inbox = process.env.SUPPORT_EMAIL?.trim() || BRAND.supportEmail;
  const topic = topicLabels[parsed.data.topic];
  const subject = `رسالة دعم — ${topic} — ${parsed.data.name}`;
  const text = [
    `الاسم: ${parsed.data.name}`,
    `البريد: ${parsed.data.email}`,
    `الموضوع: ${topic}`,
    "",
    parsed.data.message,
  ].join("\n");

  const safeMessage = parsed.data.message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  const emailed = await deliverEmailSafely({
    eventType: "support_inbox",
    to: inbox,
    subject,
    text,
    html: `<div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;"><p><strong>${parsed.data.name}</strong><br/>${parsed.data.email}</p><p>الموضوع: ${topic}</p><p>${safeMessage}</p></div>`,
  });

  await deliverEmailSafely({
    eventType: "support_ack",
    to: parsed.data.email,
    subject: `استلمنا رسالتك في ${BRAND.nameAr}`,
    text: `مرحبًا ${parsed.data.name}،\nاستلمنا رسالتك حول «${topic}» وسنعود إليك في أقرب وقت.\nفريق ${BRAND.nameAr}`,
    html: `<div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;"><p>مرحبًا ${parsed.data.name}،</p><p>استلمنا رسالتك حول «${topic}» وسنعود إليك في أقرب وقت.</p><p>فريق ${BRAND.nameAr}</p></div>`,
  });

  return NextResponse.json({ ok: true, emailed });
}
