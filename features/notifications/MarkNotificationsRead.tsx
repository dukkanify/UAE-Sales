"use client";

import { useEffect } from "react";
import { markNotificationsRead } from "@/features/notifications/notification-client";

/** Marks in-app notifications as read when the profile inbox is opened. */
export function MarkNotificationsRead() {
  useEffect(() => {
    void markNotificationsRead();
  }, []);

  return null;
}
