import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE } from "@/lib/auth/session";
import { handleApiRoute } from "@/lib/api/response";

export async function POST() {
  return handleApiRoute(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ loggedOut: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    return response;
  });
}
