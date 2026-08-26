import { NextResponse } from "next/server";
import { isSessionUser } from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import {
  createConnectAccountLink,
  createConnectExpressLoginLink,
  getConnectStatusForUser,
  syncConnectAccountFromStripe,
} from "@/services/payments/stripe-connect.service";

export async function GET() {
  const admin = await requireAdminPermission("payments");
  if (!isSessionUser(admin)) {
    return admin;
  }

  try {
    const connect = await getConnectStatusForUser(admin, { sync: true });
    return NextResponse.json({ connect });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CONNECT_STATUS_FAILED";
    if (message === "STRIPE_NOT_CONFIGURED") {
      const connect = await getConnectStatusForUser(admin, { sync: false });
      return NextResponse.json({ connect });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminPermission("payments");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
  };
  const action = body.action ?? "onboard";

  try {
    if (action === "refresh-status") {
      const record = await syncConnectAccountFromStripe(admin.id);
      const connect = await getConnectStatusForUser(admin, { sync: false });
      return NextResponse.json({
        ok: true,
        connect,
        synced: Boolean(record),
      });
    }

    if (action === "dashboard") {
      const url = await createConnectExpressLoginLink(admin);
      return NextResponse.json({ ok: true, url });
    }

    const link = await createConnectAccountLink(admin);
    return NextResponse.json({
      ok: true,
      url: link.url,
      stripeAccountId: link.stripeAccountId,
      connect: await getConnectStatusForUser(admin, { sync: false }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CONNECT_ACTION_FAILED";
    const status =
      message === "STRIPE_NOT_CONFIGURED"
        ? 503
        : message === "STRIPE_NOT_CONNECTED" ||
            message === "STRIPE_ONBOARDING_INCOMPLETE"
          ? 409
          : 500;
    return NextResponse.json(
      {
        error: message,
        message:
          message === "STRIPE_NOT_CONFIGURED"
            ? "اضبط مفاتيح Stripe للمنصة أولاً قبل بدء ربط Connect."
            : message,
      },
      { status },
    );
  }
}
