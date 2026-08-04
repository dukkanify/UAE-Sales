"use client";

import * as React from "react";
import { Download, Search, StickyNote, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { learningFetch, learningJson } from "@/features/learning/lib/api";
import type { StudentNote } from "@/types/learning";

function NotesLibraryView() {
  const [notes, setNotes] = React.useState<StudentNote[]>([]);
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState<StudentNote | null>(null);

  const load = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const result = await learningFetch<StudentNote[]>(`/api/learning/notes?${params}`);
    setNotes(result.data ?? []);
  }, [q]);

  React.useEffect(() => {
    const t = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(t);
  }, [load]);

  async function saveEdit() {
    if (!editing) return;
    await learningJson(`/api/learning/notes/${editing.id}`, "PATCH", {
      title: editing.title,
      body: editing.body,
    });
    setEditing(null);
    void load();
  }

  async function remove(id: string) {
    await learningJson(`/api/learning/notes/${id}`, "DELETE");
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson notes"
        description="Private notes across your enrolled courses."
        breadcrumbs={[{ label: "Student" }, { label: "Notes" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = "/api/learning/notes?export=md";
            }}
          >
            <Download className="size-4" />
            Export Markdown
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="h-6 w-6" />}
          title="No notes yet"
          description="Create notes inside the course player."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <CardTitle className="text-base">{note.title}</CardTitle>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(note)}>
                    Edit
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => void remove(note.id)}
                    aria-label="Delete note"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note.body}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Updated {new Date(note.updatedAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing ? (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Edit note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <Textarea
              rows={6}
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={() => void saveEdit()}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export { NotesLibraryView };
