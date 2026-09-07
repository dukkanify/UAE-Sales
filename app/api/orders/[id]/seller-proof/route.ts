import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { submitSellerProof } from "@/services/payments/order-service";

type RouteParams = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  proofUrls: z.array(z.string().min(1).max(6_000_000)).min(1).max(12).optional(),
  items: z
    .array(
      z.object({
        storageUrl: z.string().min(1).max(6_000_000),
        kind: z.enum(["photo", "video", "document"]).optional(),
      }),
    )
    .min(1)
    .max(12)
    .optional(),
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

    const urls =
      parsed.data.proofUrls ??
      parsed.data.items?.map((item) => item.storageUrl) ??
      [];

    const order = await submitSellerProof(
      id,
      user.id,
      urls,
      parsed.data.note,
      parsed.data.items,
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
        : message === "INVALID_STATUS" ||
            message === "INVALID_PROOF" ||
            message === "FILE_TOO_LARGE" ||
            message === "INVALID_IMAGE_TYPE" ||
            message === "INVALID_VIDEO_TYPE" ||
            message === "TOO_MANY_FILES"
          ? 409
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
