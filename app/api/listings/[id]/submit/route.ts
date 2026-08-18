import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { submitListingForReview } from "@/services/listings/listing-review";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  try {
    const { id } = await params;
    const listing = await submitListingForReview(id, user.id);
    return NextResponse.json({ listing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "UNAUTHORIZED"
        ? 403
        : message === "NOT_FOUND"
          ? 404
          : message === "INVALID_STATUS"
            ? 409
            : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
