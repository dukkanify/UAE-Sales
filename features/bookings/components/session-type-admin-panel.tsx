"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { bookingJson } from "@/features/bookings/lib/api";
import type { BookingSessionType, BookingSettings } from "@/types/bookings";
import type { UserProfile } from "@/types";

function newSessionType(): BookingSessionType {
  return {
    id: `st_${Date.now().toString(36)}`,
    name: "New service",
    description: "Describe this private session offering.",
    durationMinutes: 60,
    active: true,
    priceAmountMinor: 0,
    currency: "KWD",
    paymentRequired: false,
    instructorIds: [],
  };
}

type SessionTypeAdminPanelProps = {
  settings: BookingSettings;
  instructors: UserProfile[];
  onChange: (sessionTypes: BookingSessionType[]) => void;
  saving?: boolean;
};

function SessionTypeAdminPanel({
  settings,
  instructors,
  onChange,
  saving,
}: SessionTypeAdminPanelProps) {
  const [draft, setDraft] = React.useState(settings.sessionTypes);

  React.useEffect(() => {
    setDraft(settings.sessionTypes);
  }, [settings.sessionTypes]);

  function updateType(id: string, patch: Partial<BookingSessionType>) {
    setDraft((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeType(id: string) {
    setDraft((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleInstructor(typeId: string, instructorId: string) {
    setDraft((prev) =>
      prev.map((t) => {
        if (t.id !== typeId) return t;
        const has = t.instructorIds.includes(instructorId);
        const next = has
          ? t.instructorIds.filter((x) => x !== instructorId)
          : [...t.instructorIds, instructorId];
        return { ...t, instructorIds: next };
      }),
    );
  }

  async function saveTypes(next: BookingSessionType[]) {
    const res = await bookingJson<BookingSettings>("/api/bookings/settings", "PATCH", {
      sessionTypes: next,
    });
    if (!res.success || !res.data) {
      toast.error(res.error ?? "Could not save services");
      return;
    }
    onChange(res.data.sessionTypes);
    toast.success("Private session services updated");
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label className="text-base">Private session services</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Add, edit, or disable standalone premium services. Assign instructors per service. Empty
            instructor list = all bookable instructors.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={saving}
          onClick={() => setDraft((prev) => [...prev, newSessionType()])}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add service
        </Button>
      </div>

      <ul className="space-y-4">
        {draft.map((t) => (
          <li key={t.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={t.active ? "default" : "outline"}>
                  {t.active ? "Active" : "Disabled"}
                </Badge>
                <Switch
                  checked={t.active}
                  onCheckedChange={(v) => updateType(t.id, { active: v === true })}
                  aria-label={`Toggle ${t.name}`}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={draft.length <= 1}
                onClick={() => removeType(t.id)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor={`name-${t.id}`}>Name</Label>
                <input
                  id={`name-${t.id}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={t.name}
                  onChange={(e) => updateType(t.id, { name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`duration-${t.id}`}>Duration (minutes)</Label>
                <input
                  id={`duration-${t.id}`}
                  type="number"
                  min={15}
                  max={240}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={t.durationMinutes}
                  onChange={(e) =>
                    updateType(t.id, { durationMinutes: Number(e.target.value) || 60 })
                  }
                />
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <Label htmlFor={`desc-${t.id}`}>Description</Label>
              <textarea
                id={`desc-${t.id}`}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={t.description}
                onChange={(e) => updateType(t.id, { description: e.target.value })}
              />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor={`price-${t.id}`}>Price (minor units)</Label>
                <input
                  id={`price-${t.id}`}
                  type="number"
                  min={0}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={t.priceAmountMinor}
                  onChange={(e) =>
                    updateType(t.id, { priceAmountMinor: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`currency-${t.id}`}>Currency</Label>
                <input
                  id={`currency-${t.id}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm uppercase"
                  value={t.currency}
                  onChange={(e) => updateType(t.id, { currency: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  checked={t.paymentRequired}
                  onCheckedChange={(v) => updateType(t.id, { paymentRequired: v === true })}
                />
                <Label>Payment required</Label>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <Label>Assigned instructors</Label>
              <div className="flex flex-wrap gap-2">
                {instructors.map((i) => {
                  const selected = t.instructorIds.length === 0 || t.instructorIds.includes(i.id);
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => toggleInstructor(t.id, i.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium ring-1 transition ${
                        selected
                          ? "bg-primary/10 text-primary ring-primary/30"
                          : "bg-muted/40 text-muted-foreground ring-border"
                      }`}
                    >
                      {i.fullName || i.email}
                    </button>
                  );
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="accent"
          disabled={saving}
          onClick={() => void saveTypes(draft)}
        >
          Save services
        </Button>
      </div>
    </div>
  );
}

export { SessionTypeAdminPanel };
