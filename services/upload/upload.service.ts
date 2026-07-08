import { persistImageFiles } from "@/shared/utils/persist-images";

/**
 * Demo: compress + data URL in localStorage.
 * Production: swap provider via NEXT_PUBLIC_UPLOAD_PROVIDER (cloudinary | s3 | supabase).
 */
export async function uploadListingImages(files: File[]): Promise<string[]> {
  const provider = process.env.NEXT_PUBLIC_UPLOAD_PROVIDER;

  if (provider && provider !== "local") {
    // Production hook — wire to CDN when backend is available
    console.warn(
      `[upload] Provider "${provider}" not wired yet — falling back to local compression.`,
    );
  }

  return persistImageFiles(files);
}
