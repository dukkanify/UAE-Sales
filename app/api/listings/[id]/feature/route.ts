import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { initiateFeaturedCheckout } from "@/services/payments/featured-checkout.service";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const { id } = await params;
  let confirmMock = false;
  try {
    const body = (await request.json()) as { confirmMock?: boolean };
    confirmMock = Boolean(body?.confirmMock);
  } catch {
    confirmMock = false;
  }

  try {
    const result = await initiateFeaturedCheckout(id, user.id, { confirmMock });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "LISTING_NOT_FOUND"
        ? 404
        : message === "UNAUTHORIZED"
          ? 403
          : message === "ALREADY_FEATURED"
            ? 409
            : message === "STRIPE_NOT_CONFIGURED"
              ? 503
              : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
