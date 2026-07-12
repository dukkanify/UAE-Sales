import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/services/auth/session-cookie";

export async function GET() {
  const user = await getSessionFromCookie();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
