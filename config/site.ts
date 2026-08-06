/**
 * Application-wide site configuration — AviatorPass defaults.
 * Runtime overrides live in platform settings (Super Admin).
 *
 * Prefer `@/config/site-static` inside Client Components so the browser
 * bundle never depends on Zod / env parsing.
 */

import { publicEnv } from "@/config/env";
import { siteStatic } from "@/config/site-static";

export const siteConfig = {
  ...siteStatic,
  url: publicEnv.NEXT_PUBLIC_APP_URL,
} as const;

export type SiteConfig = typeof siteConfig;
