"use client";

import Link from "next/link";
import type { ChatConversation } from "@/types/domain/chat";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";

type ConversationListProps = {
  activeId?: string;
  conversations: ChatConversation[];
  loading?: boolean;
};

export function ConversationList({
  activeId,
  conversations,
  loading = false,
}: ConversationListProps) {
  if (loading) {
    return (
      <Card className="marketplace-panel p-4" variant="flat">
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="!rounded-full" height="3rem" width="3rem" />
              <div className="flex-1 space-y-2">
                <Skeleton height="0.75rem" width="60%" />
                <Skeleton height="0.65rem" width="90%" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="marketplace-panel p-4" variant="flat">
        <EmptyState
          description="ابدأ محادثة من صفحة أي إعلان عبر زر «محادثة البائع»."
          icon="message"
          title="لا توجد محادثات"
        />
      </Card>
    );
  }

  return (
    <Card className="marketplace-panel divide-y divide-border/60 overflow-hidden p-0" variant="flat">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          className={`flex gap-3 px-4 py-4 transition hover:bg-surface-muted/60 ${
            activeId === conversation.id ? "bg-primary-soft/40" : ""
          }`}
          href={`/chat/${conversation.id}`}
        >
          <span className="relative size-12 shrink-0 overflow-hidden rounded-full">
            <AppImage
              alt={conversation.participantName}
              className="object-cover"
              fallback="avatar"
              fill
              sizes="48px"
              src={conversation.participantAvatarUrl}
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-ink">
                {conversation.participantName}
              </p>
              <span className="shrink-0 text-[11px] text-muted">
                {new Date(conversation.lastMessageAt).toLocaleDateString("ar-AE", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-primary">
              {conversation.listingTitle}
            </p>
            <p className="mt-1 truncate text-sm text-muted">
              {conversation.lastMessage}
            </p>
          </div>
          {conversation.unreadCount > 0 ? (
            <Badge variant="new">{conversation.unreadCount}</Badge>
          ) : null}
        </Link>
      ))}
    </Card>
  );
}
