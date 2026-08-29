"use client";

/**
 * Refresh the signed httpOnly session from the server (no client profile trust).
 * Login/register routes already set the cookie; this only re-issues after profile updates.
 */
export async function persistSessionCookie(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      credentials: "same-origin",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function removeSessionCookie(): Promise<void> {
  try {
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "same-origin",
    });
  } catch {
    // Non-blocking on logout.
  }
}
