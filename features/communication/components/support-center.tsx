"use client";

import * as React from "react";
import { Headset, Send } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TICKET_STATUS_LABELS, TICKET_TYPE_LABELS } from "@/constants/communication";
import { cn } from "@/lib/utils";
import { commFetch, commJson } from "@/features/communication/lib/api";
import type { SupportTicket, TicketReply, TicketStatus, TicketType } from "@/types/communication";

function SupportCenter({ manage = false }: { manage?: boolean }) {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [replies, setReplies] = React.useState<TicketReply[]>([]);
  const [stats, setStats] = React.useState<Record<string, number> | null>(null);
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState<TicketType>("general");
  const [reply, setReply] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const result = await commFetch<SupportTicket[]>("/api/communication/tickets");
    setTickets(result.data ?? []);
    if (manage) {
      const s = await commFetch<Record<string, number>>("/api/communication/tickets?stats=1");
      setStats(s.data);
    }
  }, [manage]);

  const loadTicket = React.useCallback(async (id: string) => {
    const result = await commFetch<{ ticket: SupportTicket; replies: TicketReply[] }>(
      `/api/communication/tickets?id=${id}`,
    );
    if (result.data) {
      setReplies(result.data.replies);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (activeId) void loadTicket(activeId);
  }, [activeId, loadTicket]);

  async function create() {
    const result = await commJson<SupportTicket>("/api/communication/tickets", "POST", {
      action: "create",
      type,
      subject,
      description,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSubject("");
    setDescription("");
    void load();
  }

  async function sendReply() {
    if (!activeId || !reply.trim()) return;
    const result = await commJson("/api/communication/tickets", "POST", {
      action: "reply",
      ticketId: activeId,
      body: reply,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setReply("");
    void loadTicket(activeId);
    void load();
  }

  async function setStatus(status: TicketStatus) {
    if (!activeId) return;
    await commJson("/api/communication/tickets", "POST", {
      action: "update",
      ticketId: activeId,
      status,
    });
    void load();
    void loadTicket(activeId);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={manage ? "Support dashboard" : "Support center"}
        description="Technical, course, account, and general tickets with response tracking."
        breadcrumbs={[{ label: "Communication" }, { label: "Support" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(stats).map(([k, v]) => (
            <Card key={k}>
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                <p className="font-display text-2xl">{v}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {!manage ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Headset className="size-4" />
              New ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as TicketType)}
            >
              {Object.entries(TICKET_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Describe the issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button onClick={() => void create()}>Submit ticket</Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-2">
          {tickets.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={cn(
                "w-full rounded-lg border border-border px-3 py-3 text-left hover:bg-muted/50",
                activeId === t.id && "border-primary bg-muted",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs">{t.ticketNumber}</span>
                <Badge variant="secondary">{TICKET_STATUS_LABELS[t.status]}</Badge>
              </div>
              <p className="mt-1 text-sm font-medium">{t.subject}</p>
            </button>
          ))}
        </aside>

        <section>
          {!activeId ? (
            <p className="text-sm text-muted-foreground">Select a ticket to view the thread.</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {tickets.find((t) => t.id === activeId)?.subject}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {tickets.find((t) => t.id === activeId)?.description}
                </p>
                {manage ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map((s) => (
                      <Button key={s} size="sm" variant="outline" onClick={() => void setStatus(s)}>
                        {TICKET_STATUS_LABELS[s]}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {replies.map((r) => (
                    <div key={r.id} className="rounded-md border border-border px-3 py-2 text-sm">
                      <p className="text-xs text-muted-foreground">
                        {r.authorName}
                        {r.isStaff ? " · staff" : ""} · {new Date(r.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{r.body}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply…"
                  />
                  <Button className="self-end" onClick={() => void sendReply()}>
                    <Send className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

export { SupportCenter };
