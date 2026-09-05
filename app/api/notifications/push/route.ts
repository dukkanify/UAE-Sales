import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import {
  deletePushSubscription,
  savePushSubscription,
} from "@/services/notifications/push-subscriptions";
import { getVapidPublicKey } from "@/services/notifications/web-push-client";

export async function GET() {
  const publicKey = await getVapidPublicKey();
  return NextResponse.json({
    publicKey,
    enabled: Boolean(publicKey),
  });
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) {
    return user;
  }

  const body = (await request.json().catch(() => null)) as {
    endpoint?: unknown;
    keys?: { auth?: unknown; p256dh?: unknown };
  } | null;

  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
  const auth = typeof body?.keys?.auth === "string" ? body.keys.auth.trim() : "";
  const p256dh =
    typeof body?.keys?.p256dh === "string" ? body.keys.p256dh.trim() : "";

  if (!endpoint.startsWith("https://") || !auth || !p256dh) {
    return NextResponse.json({ error: "INVALID_SUBSCRIPTION" }, { status: 400 });
  }

  await savePushSubscription({
    userId: user.id,
    endpoint,
    keys: { auth, p256dh },
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) {
    return user;
  }

  const body = (await request.json().catch(() => null)) as { endpoint?: unknown } | null;
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) {
    return NextResponse.json({ error: "INVALID_SUBSCRIPTION" }, { status: 400 });
  }

  await deletePushSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
