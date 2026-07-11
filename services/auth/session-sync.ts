"use client";

import type { UserProfile } from "@/types";

export async function persistSessionCookie(user: UserProfile): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user }),
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
