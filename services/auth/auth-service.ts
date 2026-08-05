import { isSupabaseConfigured } from "@/config/env";
import type { LoginInput, RegisterInput, VerifyOtpInput } from "@/utils/validation";
import type { ApiResponse } from "@/types";

/**
 * Auth service layer — Email OTP via Supabase Auth.
 * Ready for wiring when Supabase credentials are configured.
 */

export async function sendLoginOtp(input: LoginInput): Promise<ApiResponse<{ email: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      data: null,
      error: "Authentication is not configured. Set Supabase environment variables.",
    };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  if (!supabase) {
    return { success: false, data: null, error: "Unable to initialize auth client." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: { email: input.email }, error: null };
}

export async function sendRegisterOtp(
  input: RegisterInput,
): Promise<ApiResponse<{ email: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      data: null,
      error: "Authentication is not configured. Set Supabase environment variables.",
    };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  if (!supabase) {
    return { success: false, data: null, error: "Unable to initialize auth client." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: {
      shouldCreateUser: true,
      data: { full_name: input.fullName },
    },
  });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: { email: input.email }, error: null };
}

export async function verifyOtp(
  input: VerifyOtpInput,
): Promise<ApiResponse<{ verified: boolean }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      data: null,
      error: "Authentication is not configured. Set Supabase environment variables.",
    };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  if (!supabase) {
    return { success: false, data: null, error: "Unable to initialize auth client." };
  }

  const { error } = await supabase.auth.verifyOtp({
    email: input.email,
    token: input.token,
    type: "email",
  });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: { verified: true }, error: null };
}

export async function signOut(): Promise<ApiResponse<null>> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: null, error: null };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  if (!supabase) {
    return { success: false, data: null, error: "Unable to initialize auth client." };
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
