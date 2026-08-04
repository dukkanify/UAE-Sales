import { createClient } from "@supabase/supabase-js";

import { publicEnv, getServerEnv, isSupabaseConfigured } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Admin Supabase client with service role key.
 * Server-only — never import in Client Components.
 */
export function createAdminClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const serverEnv = getServerEnv();

  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations");
  }

  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
