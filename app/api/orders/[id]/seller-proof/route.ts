import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { submitSellerProof } from "@/services/payments/order-service";

type RouteParams = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  proofUrls: z.array(z.string().min(1).max(2000)).min(1).max(10),
  note: z.string().max(1000).optional(),
});

export async function POST(request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const order = await submitSellerProof(
      id,
      user.id,
      parsed.data.proofUrls,
      parsed.data.note,
    );
    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "UNAUTHORIZED"
        ? 403
        : message === "INVALID_STATUS" || message === "INVALID_PROOF"
          ? 409
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
