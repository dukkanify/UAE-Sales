import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { updateNotificationPreferences } from "@/services/auth/user-store";
import { resolveNotificationPreferences } from "@/services/notifications/notification-preferences";

const schema = z.object({
  email: z.boolean().optional(),
  bookingUpdates: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  messages: z.boolean().optional(),
  marketing: z.boolean().optional(),
  savedSearches: z.boolean().optional(),
  locale: z.enum(["ar", "en"]).optional(),
});

export async function GET() {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;
  return NextResponse.json({
    preferences: resolveNotificationPreferences(user),
    locale: user.locale ?? "ar",
  });
}

export async function PATCH(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const updated = await updateNotificationPreferences(user.id, parsed.data);
  return NextResponse.json({
    preferences: resolveNotificationPreferences(updated),
    locale: updated.locale ?? "ar",
  });
}
