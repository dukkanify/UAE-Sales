"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatListingRedirect } from "@/features/chat/components/ChatListingRedirect";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

function ChatEmptyState() {
  return (
    <Card className="marketplace-panel flex min-h-[28rem] items-center justify-center p-8" variant="flat">
      <EmptyState
        description="اختر محادثة من القائمة أو ابدأ محادثة جديدة من صفحة الإعلان."
        icon="message"
        title="اختر محادثة"
      />
    </Card>
  );
}

function ChatMainContent() {
  const searchParams = useSearchParams();
  const listingSlug = searchParams.get("listing");

  if (listingSlug) {
    return <ChatListingRedirect />;
  }

  return <ChatEmptyState />;
}

export function ChatMainPanel() {
  return (
    <Suspense fallback={<ChatEmptyState />}>
      <ChatMainContent />
    </Suspense>
  );
}
