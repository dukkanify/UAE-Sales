import { NextResponse } from "next/server";
import { z } from "zod";
import { BRAND } from "@/shared/constants/brand";
import { deliverEmailSafely } from "@/services/email/email.service";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  topic: z.enum(["order", "listing", "escrow", "account", "other"]),
  message: z.string().trim().min(10).max(2000),
});

const topicLabels: Record<z.infer<typeof schema>["topic"], string> = {
  order: "طلب / دفع",
  listing: "إعلان",
  escrow: "ضمان مالي",
  account: "حساب",
  other: "أخرى",
};

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "أكمل البيانات المطلوبة بشكل صحيح." },
      { status: 400 },
    );
  }

  const inbox =
    process.env.SUPPORT_EMAIL?.trim() || BRAND.supportEmail;
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
