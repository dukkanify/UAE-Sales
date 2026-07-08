"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { getChatConversations } from "@/services/chat";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";

export function ChatInboxList() {
  const [threads, setThreads] = useState(() =>
    typeof window !== "undefined" ? getChatConversations() : [],
  );

  useEffect(() => {
    const sync = () => setThreads(getChatConversations());
    sync();
    window.addEventListener(STORAGE_EVENTS.chatChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.chatChange, sync);
  }, []);

  if (threads.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted">
        لا توجد محادثات بعد. افتح «محادثة البائع» من أي إعلان لبدء محادثة.
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">{threads.length} محادثة</p>
      {threads.map((thread) => {
        const lastMessage = thread.messages[thread.messages.length - 1];
        return (
          <Card key={thread.id} className="p-4" interactive variant="flat">
            <Link className="flex gap-4" href={`/chat/${thread.id}`}>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                {thread.sellerName.slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">
                    {thread.sellerName}
                  </p>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(thread.updatedAt).toLocaleDateString("ar-AE", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs font-medium text-primary">
                  {thread.listingTitle}
                </p>
                <p className="mt-1 truncate text-sm text-muted">
                  {lastMessage?.body}
                </p>
              </div>
              <Badge variant="muted">{thread.messages.length}</Badge>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
