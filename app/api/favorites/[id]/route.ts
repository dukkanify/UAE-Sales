import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { removeFavorite } from "@/services/favorites/favorite-store";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const { id } = await context.params;
  const removed = await removeFavorite(user.id, id);
  if (!removed) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
