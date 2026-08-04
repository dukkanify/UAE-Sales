"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bot,
  History,
  Loader2,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { aiFetch, aiJson } from "@/features/ai/lib/api";
import type {
  AiAssistantPersona,
  AiConversation,
  AiMessage,
  AiUserContext,
} from "@/types/ai";

type Bootstrap = {
  persona: AiAssistantPersona;
  featureEnabled: boolean;
  suggestions: Array<{ title: string; prompt: string }>;
  context: AiUserContext;
};

function FloatingAiAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [boot, setBoot] = React.useState<Bootstrap | null>(null);
  const [conversations, setConversations] = React.useState<AiConversation[]>([]);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<AiMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"chat" | "history" | "context">("chat");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const hubHref =
    user?.role === "super_admin"
      ? "/super-admin/ai"
      : user?.role === "admin"
        ? "/admin/ai"
        : user?.role === "instructor"
          ? "/instructor/ai"
          : "/student/ai";

  React.useEffect(() => {
    if (!user) return;
    void aiFetch<Bootstrap>("/api/ai/chat?view=bootstrap").then((r) => {
      if (r.success && r.data) setBoot(r.data);
    });
  }, [user]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, open]);

  async function loadHistory() {
    const r = await aiFetch<AiConversation[]>("/api/ai/chat?view=conversations");
    setConversations(r.data ?? []);
  }

  async function openConversation(id: string) {
    const r = await aiFetch<{ conversation: AiConversation; messages: AiMessage[] }>(
      `/api/ai/chat?view=messages&id=${id}`,
    );
    if (r.data) {
      setConversationId(r.data.conversation.id);
      setMessages(r.data.messages);
      setTab("chat");
    }
  }

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setBusy(true);
    setError(null);
    setInput("");
    setStreaming("");
    setTab("chat");

    const optimistic: AiMessage = {
      id: `tmp-${Date.now()}`,
      conversationId: conversationId ?? "tmp",
      role: "user",
      content: message,
      intent: null,
      metadata: {},
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        const fallback = await aiJson<{
          conversation: AiConversation;
          userMessage: AiMessage;
          assistantMessage: AiMessage;
        }>("/api/ai/chat", "POST", { message, conversationId });
        if (!fallback.success || !fallback.data) {
          setError(fallback.error ?? "AI request failed");
          setBusy(false);
          return;
        }
        setConversationId(fallback.data.conversation.id);
        setMessages((m) => [
          ...m.filter((x) => x.id !== optimistic.id),
          fallback.data!.userMessage,
          fallback.data!.assistantMessage,
        ]);
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantId = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.replace(/^data:\s*/, "").trim();
          if (!line) continue;
          const event = JSON.parse(line) as {
            type: string;
            data: Record<string, unknown>;
          };
          if (event.type === "meta") {
            setConversationId(String(event.data.conversationId));
            assistantId = String(event.data.assistantMessageId ?? "");
          } else if (event.type === "token") {
            acc += String(event.data.token ?? "");
            setStreaming(acc);
          } else if (event.type === "done") {
            const msg = event.data.message as AiMessage;
            setMessages((m) => [
              ...m.filter((x) => x.id !== optimistic.id),
              {
                ...optimistic,
                id: String((event.data as { userMessageId?: string }).userMessageId ?? optimistic.id),
                conversationId: msg.conversationId,
              },
              msg,
            ]);
            setStreaming("");
          } else if (event.type === "error") {
            setError(String(event.data.message ?? "Stream error"));
          }
        }
      }
      void assistantId;
    } catch {
      setError("Unable to reach AI assistant");
    }
    setBusy(false);
  }

  async function feedback(messageId: string, rating: "up" | "down") {
    await aiJson("/api/ai/chat", "POST", { action: "feedback", messageId, rating });
  }

  if (!user || boot?.featureEnabled === false) return null;

  return (
    <>
      <motion.button
        type="button"
        aria-label="Open AI assistant"
        className="fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          setOpen(true);
          void loadHistory();
        }}
      >
        <Sparkles className="size-6" />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 end-5 z-50 flex h-[min(640px,calc(100vh-2.5rem))] w-[min(420px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b bg-gradient-to-r from-primary/10 via-card to-sky-500/10 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold">AI Learning Assistant</p>
                <p className="truncate text-xs text-muted-foreground capitalize">
                  {boot?.persona ?? "assistant"} · grounded in your permissions
                </p>
              </div>
              <Button size="icon" variant="ghost" asChild>
                <Link href={hubHref} title="Open AI hub">
                  <History className="size-4" />
                </Link>
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex gap-1 border-b px-3 py-2">
              {(["chat", "history", "context"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={tab === t ? "secondary" : "ghost"}
                  className="capitalize"
                  onClick={() => {
                    setTab(t);
                    if (t === "history") void loadHistory();
                  }}
                >
                  {t}
                </Button>
              ))}
            </div>

            {tab === "context" ? (
              <ScrollArea className="flex-1 p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  Platform context
                </p>
                <div className="space-y-2 text-sm">
                  {(boot?.context.enrolledCourses ?? []).map((c) => (
                    <div key={c.id} className="rounded-lg border px-3 py-2">
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.code} · {c.progress}%
                      </p>
                    </div>
                  ))}
                  {!boot?.context.enrolledCourses.length ? (
                    <p className="text-muted-foreground">No course context yet.</p>
                  ) : null}
                </div>
              </ScrollArea>
            ) : null}

            {tab === "history" ? (
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full rounded-lg border px-3 py-2 text-start text-sm hover:bg-muted/50"
                      onClick={() => void openConversation(c.id)}
                    >
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.updatedAt).toLocaleString()}
                      </p>
                    </button>
                  ))}
                  {!conversations.length ? (
                    <p className="p-2 text-sm text-muted-foreground">No conversations yet.</p>
                  ) : null}
                </div>
              </ScrollArea>
            ) : null}

            {tab === "chat" ? (
              <>
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="space-y-3">
                    {!messages.length && !streaming ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Ask about lessons, plans, quizzes, or platform search. I won’t invent enrollments or replace your instructor.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(boot?.suggestions ?? []).slice(0, 6).map((s) => (
                            <button
                              key={s.title}
                              type="button"
                              className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
                              onClick={() => void send(s.prompt)}
                            >
                              {s.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                          m.role === "user"
                            ? "ms-8 bg-primary text-primary-foreground"
                            : "me-6 border bg-muted/40",
                        )}
                      >
                        {m.content}
                        {m.role === "assistant" && !m.id.startsWith("tmp-") ? (
                          <div className="mt-2 flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => void feedback(m.id, "up")}
                            >
                              <ThumbsUp className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => void feedback(m.id, "down")}
                            >
                              <ThumbsDown className="size-3.5" />
                            </Button>
                            {m.intent ? (
                              <Badge variant="secondary" className="ms-auto text-[10px]">
                                {m.intent}
                              </Badge>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                    {streaming ? (
                      <div className="me-6 rounded-2xl border bg-muted/40 px-3 py-2 text-sm whitespace-pre-wrap">
                        {streaming}
                        <span className="animate-pulse">▍</span>
                      </div>
                    ) : null}
                    <div ref={bottomRef} />
                  </div>
                </ScrollArea>

                {error ? <p className="px-4 text-xs text-destructive">{error}</p> : null}

                <form
                  className="flex gap-2 border-t p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send();
                  }}
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the AI assistant…"
                    disabled={busy}
                  />
                  <Button type="submit" size="icon" disabled={busy || !input.trim()}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </form>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export { FloatingAiAssistant };
