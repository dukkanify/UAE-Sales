import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromCookie } from "@/services/auth/session-cookie";
import { checkRateLimit, getClientIp } from "@/services/auth/rate-limit";
import { notifyChatMessage } from "@/services/notifications/notification-events";

const schema = z.object({
  conversationId: z.string().min(1).max(120),
  listingTitle: z.string().min(1).max(180),
  preview: z.string().min(1).max(500),
  recipientUserId: z.string().min(1).max(120),
  senderName: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
    }

    const session = await getSessionFromCookie();
    const senderId = session?.id;
    if (senderId && senderId === parsed.data.recipientUserId) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`chat-email:${senderId ?? ip}`);
    if (!allowed) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    void notifyChatMessage({
      conversationId: parsed.data.conversationId,
      listingTitle: parsed.data.listingTitle,
      preview: parsed.data.preview,
      recipientUserId: parsed.data.recipientUserId,
      senderName: session?.fullName || parsed.data.senderName,
    }).catch((error) => {
      console.error("[Sooqna Notify] chat notify failed", error);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Sooqna Notify] chat notify route failed", error);
    return NextResponse.json({ ok: true });
  }
}
