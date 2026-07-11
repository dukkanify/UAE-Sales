import { NextResponse } from "next/server";
import { z } from "zod";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const schema = z.object({
  email: z.string().email(),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
  resetToken: z.string().min(16),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const tokens = await loadCollection<{
    email: string;
    expiresAt: string;
    token: string;
  }>("password-reset-tokens.json");

  const match = tokens.find(
    (item) =>
      item.email === email &&
      item.token === parsed.data.resetToken &&
      new Date(item.expiresAt).getTime() > Date.now(),
  );

  if (!match) {
    return NextResponse.json(
      { error: "INVALID_TOKEN", message: "انتهت صلاحية رابط إعادة التعيين." },
      { status: 400 },
    );
  }

  const remaining = tokens.filter((item) => item.token !== match.token);
  await saveCollection("password-reset-tokens.json", remaining);

  // Demo accounts use fixed passwords in mock data; production would persist here.
  return NextResponse.json({
    ok: true,
    message: "تم تحديث كلمة المرور بنجاح.",
  });
}
