"use client";

import * as React from "react";
import {
  Archive,
  BellOff,
  MessageSquare,
  Search,
  Send,
  Trash2,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_POLL_MS } from "@/constants/communication";
import { CONVERSATION_KIND_LABELS } from "@/constants/communication";
import { cn } from "@/lib/utils";
import { commFetch, commJson } from "@/features/communication/lib/api";
import type { Conversation, Message, TypingState } from "@/types/communication";

type ConversationRow = Conversation & { unreadCount?: number };

function MessagingCenter({ basePath }: { basePath: string }) {
  const [conversations, setConversations] = React.useState<ConversationRow[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [typing, setTyping] = React.useState<TypingState[]>([]);
  const [draft, setDraft] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [directoryQ, setDirectoryQ] = React.useState("");
  const [directory, setDirectory] = React.useState<
    Array<{ id: string; fullName: string; email: string; role: string }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const loadConversations = React.useCallback(async () => {
    const result = await commFetch<ConversationRow[]>("/api/communication/conversations");
    if (!result.success) {
      setError(result.error);
      return;
    }
    setConversations(result.data ?? []);
    setLoading(false);
  }, []);

  const loadThread = React.useCallback(async (id: string, q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    const result = await commFetch<{
      conversation: Conversation;
      messages: Message[];
      typing: TypingState[];
    }>(`/api/communication/conversations/${id}${qs}`);
    if (!result.success || !result.data) return;
    setMessages(result.data.messages);
    setTyping(result.data.typing);
    await commJson(`/api/communication/conversations/${id}`, "POST", { action: "read" });
  }, []);

  React.useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  React.useEffect(() => {
    if (!activeId) return;
    void loadThread(activeId, search || undefined);
    const timer = window.setInterval(() => {
      void loadThread(activeId, search || undefined);
    }, MESSAGE_POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeId, loadThread, search]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function startChat(peerUserId: string) {
    const result = await commJson<Conversation>("/api/communication/conversations", "POST", {
      peerUserId,
    });
    if (result.success && result.data) {
      await loadConversations();
      setActiveId(result.data.id);
      setDirectory([]);
      setDirectoryQ("");
    } else {
      setError(result.error);
    }
  }

  async function send() {
    if (!activeId || !draft.trim()) return;
    const body = draft;
    setDraft("");
    const result = await commJson<Message>(`/api/communication/conversations/${activeId}`, "POST", {
      action: "send",
      body,
    });
    if (!result.success) {
      setError(result.error);
      setDraft(body);
      return;
    }
    await loadThread(activeId);
    await loadConversations();
  }

  async function onTyping() {
    if (!activeId) return;
    await commJson(`/api/communication/conversations/${activeId}`, "POST", { action: "typing" });
  }

  async function searchDirectory(q: string) {
    setDirectoryQ(q);
    if (q.trim().length < 2) {
      setDirectory([]);
      return;
    }
    const result = await commFetch<typeof directory>(
      `/api/communication/directory?q=${encodeURIComponent(q)}`,
    );
    setDirectory(result.data ?? []);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messaging center"
        description="Secure private and group conversations inside ATPL PASS."
        breadcrumbs={[{ label: "Communication" }, { label: "Messages" }]}
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={`${basePath}/support`}>Support</a>
          </Button>
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid min-h-[560px] overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Find people…"
                value={directoryQ}
                onChange={(e) => void searchDirectory(e.target.value)}
              />
            </div>
            {directory.length > 0 ? (
              <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-border p-2">
                {directory.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className="flex w-full flex-col rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                    onClick={() => void startChat(u.id)}
                  >
                    <span className="font-medium">{u.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {u.role} · {u.email}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="max-h-[420px] overflow-auto">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left hover:bg-muted/60",
                    activeId === c.id && "bg-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{c.title}</span>
                    {(c.unreadCount ?? 0) > 0 ? (
                      <Badge variant="default">{c.unreadCount}</Badge>
                    ) : null}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {c.lastMessagePreview ?? CONVERSATION_KIND_LABELS[c.kind]}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-h-[480px] flex-col">
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
              <MessageSquare className="size-10 opacity-50" />
              <p>Select a conversation or start a new one.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div>
                  <p className="font-display text-lg">
                    {conversations.find((c) => c.id === activeId)?.title}
                  </p>
                  {typing.length > 0 ? (
                    <p className="text-xs text-accent-foreground">
                      {typing.map((t) => t.userName).join(", ")} typing…
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Delivered · read receipts enabled</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input
                    className="h-8 w-40"
                    placeholder="Search thread"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void commJson(`/api/communication/conversations/${activeId}`, "POST", {
                        action: "mute",
                        muted: true,
                      })
                    }
                  >
                    <BellOff className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void commJson(`/api/communication/conversations/${activeId}`, "POST", {
                        action: "archive",
                      }).then(loadConversations)
                    }
                  >
                    <Archive className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void commJson(`/api/communication/conversations/${activeId}`, "POST", {
                        action: "delete",
                      }).then(() => {
                        setActiveId(null);
                        void loadConversations();
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-auto p-4">
                {messages.map((m) => (
                  <div key={m.id} className="rounded-lg border border-border/70 bg-background px-3 py-2">
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{m.senderName}</span>
                      <span>
                        {new Date(m.createdAt).toLocaleString()} · {m.deliveryStatus}
                        {m.moderated ? " · flagged" : ""}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      void onTyping();
                    }}
                    placeholder="Write a secure message…"
                    className="min-h-[72px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                  />
                  <Button className="self-end" onClick={() => void send()}>
                    <Send className="size-4" />
                    Send
                  </Button>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  Content is moderated automatically. Keep communication on-platform.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export { MessagingCenter };
