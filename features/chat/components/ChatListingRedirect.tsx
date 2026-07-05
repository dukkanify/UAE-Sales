"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveListingConversationClient } from "@/services/chat/chat.client";
import { Card } from "@/shared/ui/Card";

export function ChatListingRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingSlug = searchParams.get("listing");

  useEffect(() => {
    if (!listingSlug) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      resolveListingConversationClient(listingSlug).then((conversation) => {
        router.replace(`/chat/${conversation.id}`);
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [listingSlug, router]);

  if (!listingSlug) {
    return null;
  }

  return (
    <Card className="marketplace-panel flex min-h-[28rem] items-center justify-center p-8" variant="flat">
      <p className="text-sm font-medium text-muted">جاري فتح المحادثة...</p>
    </Card>
  );
}
