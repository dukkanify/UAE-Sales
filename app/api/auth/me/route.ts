import { NextResponse } from "next/server";
import { getValidSessionUser } from "@/services/auth/require-session";

export async function GET() {
  const user = await getValidSessionUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
