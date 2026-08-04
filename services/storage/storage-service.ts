/**
 * Storage service foundation — Supabase Storage.
 */

import { publicEnv, isSupabaseConfigured } from "@/config/env";
import type { ApiResponse } from "@/types";

export async function uploadFile(
  path: string,
  file: File,
  bucket = publicEnv.NEXT_PUBLIC_STORAGE_BUCKET,
): Promise<ApiResponse<{ path: string; publicUrl: string | null }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      data: null,
      error: "Storage is not configured. Set Supabase environment variables.",
    };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  if (!supabase) {
    return { success: false, data: null, error: "Unable to initialize storage client." };
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
  });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    success: true,
    data: { path, publicUrl: data.publicUrl },
    error: null,
  };
}

export async function deleteFile(
  path: string,
  bucket = publicEnv.NEXT_PUBLIC_STORAGE_BUCKET,
): Promise<ApiResponse<null>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      data: null,
      error: "Storage is not configured.",
    };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  if (!supabase) {
    return { success: false, data: null, error: "Unable to initialize storage client." };
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
