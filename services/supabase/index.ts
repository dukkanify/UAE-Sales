/**
 * Re-export Supabase client factories for the services layer.
 */

export { createClient as createBrowserClient } from "@/lib/supabase/client";
export { createClient as createServerClient } from "@/lib/supabase/server";
export { createAdminClient } from "@/lib/supabase/admin";
export { createMiddlewareClient } from "@/lib/supabase/middleware";
