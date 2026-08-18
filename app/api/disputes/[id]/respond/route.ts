import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { respondToDispute } from "@/services/payments/dispute-service";

type RouteParams = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  message: z.string().min(8).max(2000),
});

export async function POST(request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  try {
    const { id } = await params;
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const dispute = await respondToDispute(id, user.id, parsed.data.message);
    return NextResponse.json({ dispute });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "UNAUTHORIZED"
        ? 403
        : message === "NOT_FOUND"
          ? 404
          : message === "INVALID_STATUS" || message === "INVALID_RESPONSE"
            ? 409
            : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
