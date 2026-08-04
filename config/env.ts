/**
 * Environment configuration — validated at runtime.
 * Never hardcode secrets; all values come from process.env.
 */

import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("ATPL PASS"),
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_AUTH_REDIRECT_URL: z.string().url().optional(),
  NEXT_PUBLIC_MAINTENANCE_MODE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_REALTIME: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_STORAGE_BUCKET: z.string().default("aep-uploads"),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  AUTH_OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(10),
  AUTH_SECRET: z.string().min(16).default("aep-dev-auth-secret-change-me"),
  AUTH_SESSION_DAYS: z.coerce.number().int().positive().default(7),
  AUTH_REMEMBER_ME_DAYS: z.coerce.number().int().positive().default(30),
  ENABLE_DEMO_OTP: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  DEMO_OTP_CODE: z.string().regex(/^\d{6}$/).default("123456"),
  SUPER_ADMIN_EMAIL: z.string().email().default("superadmin@eagerpilots.com"),
  SUPER_ADMIN_FIRST_NAME: z.string().default("Super"),
  SUPER_ADMIN_LAST_NAME: z.string().default("Admin"),
});

function parsePublicEnv() {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_AUTH_REDIRECT_URL: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
    NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE,
    NEXT_PUBLIC_ENABLE_REALTIME: process.env.NEXT_PUBLIC_ENABLE_REALTIME,
    NEXT_PUBLIC_STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  });

  if (!result.success) {
    console.error("Invalid public environment variables:", result.error.flatten());
    throw new Error("Invalid public environment configuration");
  }

  return result.data;
}

export const publicEnv = parsePublicEnv();

export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must only be called on the server");
  }

  const result = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    AUTH_OTP_EXPIRY_MINUTES: process.env.AUTH_OTP_EXPIRY_MINUTES,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_SESSION_DAYS: process.env.AUTH_SESSION_DAYS,
    AUTH_REMEMBER_ME_DAYS: process.env.AUTH_REMEMBER_ME_DAYS,
    ENABLE_DEMO_OTP: process.env.ENABLE_DEMO_OTP,
    DEMO_OTP_CODE: process.env.DEMO_OTP_CODE,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME,
    SUPER_ADMIN_LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME,
  });

  if (!result.success) {
    console.error("Invalid server environment variables:", result.error.flatten());
    throw new Error("Invalid server environment configuration");
  }

  return result.data;
}

export function isSupabaseConfigured(): boolean {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;

  const isPlaceholder =
    url.includes("your-project") ||
    key.includes("your-anon") ||
    key.includes("your-service");

  return !isPlaceholder;
}
