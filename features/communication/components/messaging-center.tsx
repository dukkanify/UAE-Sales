"use client";

import * as React from "react";
import {
  Archive,
  BellOff,
  Check,
  CheckCheck,
  Copy,
  Headphones,
  MessageSquare,
  Paperclip,
  Pin,
  Reply,
  Search,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONVERSATION_KIND_LABELS,
  MESSAGE_POLL_MS,
  MESSAGE_SHARE_KIND_LABELS,
} from "@/constants/communication";
import { cn } from "@/lib/utils";
import { commFetch, commJson } from "@/features/communication/lib/api";
import type {
  AttachmentRef,
  Conversation,
  Message,
  MessageReactionEmoji,
  MessageShareKind,
  PresenceState,
  TypingState,
} from "@/types/communication";

type ConversationRow = Conversation & { unreadCount?: number };

const REACTIONS: MessageReactionEmoji[] = ["👍", "❤️", "✅", "👀", "🎉"];
const COMPOSER_EMOJI = ["🙂", "✈️", "📚", "📝", "✅", "🔥", "👏", "🙏"];

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MessagingCenter({ basePath }: { basePath: string }) {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = React.useState<ConversationRow[]>([]);
  const [totalUnread, setTotalUnread] = React.useState(0);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [typing, setTyping] = React.useState<TypingState[]>([]);
  const [presence, setPresence] = React.useState<PresenceState[]>([]);
  const [draft, setDraft] = React.useState("");
  const [threadSearch, setThreadSearch] = React.useState("");
  const [convSearch, setConvSearch] = React.useState("");
  const [directoryQ, setDirectoryQ] = React.useState("");
  const [directory, setDirectory] = React.useState<
    Array<{ id: string; fullName: string; email: string; role: string }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [replyTo, setReplyTo] = React.useState<Message | null>(null);
  const [shareKind, setShareKind] = React.useState<MessageShareKind>("text");
  const [pendingFiles, setPendingFiles] = React.useState<AttachmentRef[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [forwardMessageId, setForwardMessageId] = React.useState<string | null>(null);
  const [showEmoji, setShowEmoji] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const loadConversations = React.useCallback(async () => {
    const qs = convSearch.trim() ? `?q=${encodeURIComponent(convSearch.trim())}` : "";
    const result = await commFetch<{ conversations: ConversationRow[]; totalUnread: number }>(
      `/api/communication/conversations${qs}`,
    );
    if (!result.success) {
      // Back-compat if API returns array
      const legacy = await commFetch<ConversationRow[]>("/api/communication/conversations");
      if (legacy.success && Array.isArray(legacy.data)) {
        setConversations(legacy.data);
        setLoading(false);
        return;
      }
      setError(result.error);
      return;
    }
    setConversations(result.data?.conversations ?? []);
    setTotalUnread(result.data?.totalUnread ?? 0);
    setLoading(false);
  }, [convSearch]);

  const loadThread = React.useCallback(async (id: string, q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    const result = await commFetch<{
      conversation: Conversation;
      messages: Message[];
      typing: TypingState[];
      presence?: PresenceState[];
    }>(`/api/communication/conversations/${id}${qs}`);
    if (!result.success || !result.data) return;
    setMessages(result.data.messages);
    setTyping(result.data.typing);
    setPresence(result.data.presence ?? []);
    await commJson(`/api/communication/conversations/${id}`, "POST", { action: "read" });
  }, []);

  React.useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  React.useEffect(() => {
    const c = searchParams.get("c");
    const peer = searchParams.get("peer");
    if (c) setActiveId(c);
    if (peer) void startChat(peer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  React.useEffect(() => {
    if (!activeId) return;
    void loadThread(activeId, threadSearch || undefined);
    const timer = window.setInterval(() => {
      void loadThread(activeId, threadSearch || undefined);
      void loadConversations();
    }, MESSAGE_POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeId, loadThread, threadSearch, loadConversations]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function startChat(peerUserId: string) {
    if (forwardMessageId && activeId) {
      const result = await commJson<{ conversation: Conversation }>(
        `/api/communication/conversations/${activeId}`,
        "POST",
        { action: "forward", messageId: forwardMessageId, peerUserId },
      );
      setForwardMessageId(null);
      setDirectory([]);
      setDirectoryQ("");
      if (result.success && result.data) {
        toast.success("Message forwarded");
        await loadConversations();
        setActiveId(result.data.conversation.id);
      } else {
        setError(result.error);
      }
      return;
    }
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

  async function openSupport() {
    const result = await commJson<Conversation>("/api/communication/conversations", "POST", {
      support: true,
    });
    if (result.success && result.data) {
      await loadConversations();
      setActiveId(result.data.id);
    } else setError(result.error);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: AttachmentRef[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/communication/upload", {
          method: "POST",
          body: form,
          credentials: "include",
        });
        const json = (await res.json()) as {
          success: boolean;
          data: AttachmentRef | null;
          error: string | null;
        };
        if (!json.success || !json.data) {
          toast.error(json.error ?? "Upload failed");
          continue;
        }
        uploaded.push(json.data);
      }
      setPendingFiles((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function send() {
    if (!activeId || (!draft.trim() && pendingFiles.length === 0)) return;
    const body = draft;
    const attachments = pendingFiles;
    const optimistic: Message = {
      id: `tmp_${Date.now()}`,
      conversationId: activeId,
      senderId: "me",
      senderName: "You",
      body,
      attachments,
      deliveryStatus: "sending",
      shareKind,
      replyToId: replyTo?.id ?? null,
      replyPreview: replyTo ? `${replyTo.senderName}: ${replyTo.body.slice(0, 80)}` : null,
      reactions: [],
      pinned: false,
      moderated: false,
      moderationFlags: [],
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    setPendingFiles([]);
    setReplyTo(null);
    const result = await commJson<Message>(`/api/communication/conversations/${activeId}`, "POST", {
      action: "send",
      body,
      attachments,
      replyToId: replyTo?.id ?? null,
      shareKind,
    });
    if (!result.success) {
      setError(result.error);
      setDraft(body);
      setPendingFiles(attachments);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...m, deliveryStatus: "failed" } : m)),
      );
      toast.error(result.error ?? "Send failed");
      return;
    }
    setShareKind("text");
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

  const active = conversations.find((c) => c.id === activeId);
  const peerPresence =
    active && active.kind === "direct"
      ? presence.find((p) => active.participantIds.includes(p.userId) && p.userId !== "me")
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messaging center"
        description="Secure internal communication — no phone, WhatsApp, or external chat."
        breadcrumbs={[{ label: "Communication" }, { label: "Messages" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            {totalUnread > 0 ? <Badge variant="accent">{totalUnread} unread</Badge> : null}
            <Button variant="outline" size="sm" onClick={() => void openSupport()}>
              <Headphones className="size-4" />
              Support chat
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`${basePath}/support`}>Tickets</a>
            </Button>
          </div>
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[340px_1fr]">
        <aside className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search conversations…"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={
                  forwardMessageId ? "Forward to… search a person" : "Find people to message…"
                }
                value={directoryQ}
                onChange={(e) => void searchDirectory(e.target.value)}
              />
            </div>
            {forwardMessageId ? (
              <p className="text-xs text-accent">
                Forwarding mode — pick a recipient, or{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => setForwardMessageId(null)}
                >
                  cancel
                </button>
              </p>
            ) : null}
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
                      {u.role}
                      {u.email ? ` · ${u.email}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="max-h-[480px] overflow-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/60",
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

        <section className="flex min-h-[520px] flex-col">
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
              <MessageSquare className="size-10 opacity-50" />
              <p>Select a conversation or start a secure chat.</p>
              <Button variant="outline" onClick={() => void openSupport()}>
                Open Support
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div>
                  <p className="font-display text-lg">{active?.title}</p>
                  {typing.length > 0 ? (
                    <p className="animate-pulse text-xs text-accent">
                      {typing.map((t) => t.userName).join(", ")} typing…
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {peerPresence?.status === "online" ? "Online" : "Offline"} ·{" "}
                      {CONVERSATION_KIND_LABELS[active?.kind ?? "direct"]}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input
                    className="h-8 w-40"
                    placeholder="Search thread"
                    value={threadSearch}
                    onChange={(e) => setThreadSearch(e.target.value)}
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
                {messages.map((m, idx) => {
                  const prev = messages[idx - 1];
                  const showDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
                  return (
                    <React.Fragment key={m.id}>
                      {showDay ? (
                        <div className="flex items-center gap-3 py-2">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {dayKey(m.createdAt)}
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                      ) : null}
                      <div
                        className={cn(
                          "group rounded-xl border border-border/70 bg-background px-3 py-2 transition-shadow hover:shadow-sm",
                          m.pinned && "border-accent/40 bg-accent/5",
                          m.deliveryStatus === "failed" && "border-destructive/50",
                        )}
                      >
                        {m.replyPreview ? (
                          <p className="mb-1 border-l-2 border-muted-foreground/40 pl-2 text-[11px] text-muted-foreground">
                            {m.replyPreview}
                          </p>
                        ) : null}
                        <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {m.senderName}
                            {m.shareKind && m.shareKind !== "text" ? (
                              <Badge variant="outline" className="ml-2 text-[10px]">
                                {MESSAGE_SHARE_KIND_LABELS[m.shareKind] ?? m.shareKind}
                              </Badge>
                            ) : null}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {new Date(m.createdAt).toLocaleString()}
                            {m.deliveryStatus === "read" ? (
                              <CheckCheck className="size-3.5 text-sky-500" />
                            ) : m.deliveryStatus === "delivered" || m.deliveryStatus === "sent" ? (
                              <Check className="size-3.5" />
                            ) : m.deliveryStatus === "sending" ? (
                              <span className="text-[10px]">sending…</span>
                            ) : m.deliveryStatus === "failed" ? (
                              <span className="text-[10px] text-destructive">failed</span>
                            ) : null}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                        {m.attachments?.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {m.attachments.map((a) => (
                              <a
                                key={a.id}
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                              >
                                {a.fileName}
                              </a>
                            ))}
                          </div>
                        ) : null}
                        {m.reactions?.length ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(
                              m.reactions.reduce<Record<string, number>>((acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
                                return acc;
                              }, {}),
                            ).map(([emoji, count]) => (
                              <Badge key={emoji} variant="secondary" className="text-xs">
                                {emoji} {count}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button size="sm" variant="ghost" onClick={() => setReplyTo(m)}>
                            <Reply className="size-3.5" />
                          </Button>
                          {REACTIONS.map((emoji) => (
                            <Button
                              key={emoji}
                              size="sm"
                              variant="ghost"
                              className="px-1.5"
                              onClick={() =>
                                void commJson(
                                  `/api/communication/conversations/${activeId}`,
                                  "POST",
                                  {
                                    action: "react",
                                    messageId: m.id,
                                    emoji,
                                  },
                                ).then(() => loadThread(activeId!))
                              }
                            >
                              {emoji}
                            </Button>
                          ))}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              void navigator.clipboard.writeText(m.body);
                              toast.success("Copied");
                            }}
                          >
                            <Copy className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              void commJson(
                                `/api/communication/conversations/${activeId}`,
                                "POST",
                                {
                                  action: "pin",
                                  messageId: m.id,
                                  pinned: !m.pinned,
                                },
                              ).then(() => loadThread(activeId!))
                            }
                          >
                            <Pin className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setForwardMessageId(m.id);
                              toast.message("Search a recipient to forward");
                            }}
                          >
                            Forward
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              void commJson(
                                `/api/communication/conversations/${activeId}`,
                                "POST",
                                {
                                  action: "delete_message",
                                  messageId: m.id,
                                },
                              ).then(() => loadThread(activeId!))
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-border p-4">
                {replyTo ? (
                  <div className="mb-2 flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-xs">
                    <span>
                      Replying to {replyTo.senderName}: {replyTo.body.slice(0, 60)}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : null}
                {pendingFiles.length > 0 ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {pendingFiles.map((f) => (
                      <Badge key={f.id} variant="secondary">
                        {f.fileName}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mb-2 flex flex-wrap gap-2">
                  <Select
                    value={shareKind}
                    onValueChange={(v) => setShareKind(v as MessageShareKind)}
                  >
                    <SelectTrigger className="h-8 w-48">
                      <SelectValue placeholder="Share type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MESSAGE_SHARE_KIND_LABELS).map(([k, label]) => (
                        <SelectItem key={k} value={k}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => void uploadFiles(e.target.files)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip className="size-4" />
                    {uploading ? "Uploading…" : "Attach"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowEmoji((v) => !v)}>
                    🙂
                  </Button>
                </div>
                {showEmoji ? (
                  <div className="mb-2 flex flex-wrap gap-1 rounded-md border border-border p-2">
                    {COMPOSER_EMOJI.map((e) => (
                      <button
                        key={e}
                        type="button"
                        className="rounded px-1.5 py-0.5 text-lg hover:bg-muted"
                        onClick={() => {
                          setDraft((d) => `${d}${e}`);
                          setShowEmoji(false);
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      void onTyping();
                    }}
                    placeholder="Write a secure on-platform message…"
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
                  Moderated for phone numbers, emails, and abusive language. Stay on AviatorPass.
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
