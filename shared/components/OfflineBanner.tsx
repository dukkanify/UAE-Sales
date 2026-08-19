"use client";

import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
<LocalizedTree>
    <div
      className="border-b border-accent/20 bg-accent-soft px-4 py-2 text-center text-sm font-medium text-accent"
      role="status"
    >
      أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل حتى يعود الاتصال.
    </div>
  </LocalizedTree>
);
}
