import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { routes } from "@/constants/routes";
import { publicEnv } from "@/config/env";

/**
 * Supabase Auth callback — exchanges code for session after OTP / magic link.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? routes.dashboard;

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(
    `${publicEnv.NEXT_PUBLIC_APP_URL}${routes.login}?error=auth_callback`,
  );
}
