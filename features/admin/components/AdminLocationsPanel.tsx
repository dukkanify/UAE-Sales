"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { LocationRecord } from "@/types/domain/location";
import { getSessionUser } from "@/services/storage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { Input } from "@/shared/ui/Input";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

export function AdminLocationsPanel() {
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [name, setName] = useState("");
  const [emirate, setEmirate] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    adminFetch("/api/admin/locations")
      .then((res) => res.json())
      .then((data) => setLocations(data.locations ?? []))
      .catch(() => setLocations([]));
  }, []);

  async function toggleEnabled(location: LocationRecord) {
    const session = getSessionUser();
    if (!session) return;
    setBusyId(location.id);
    try {
      const response = await adminFetch(
        `/api/admin/locations/${location.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled: !location.enabled }),
        },
      );
      const data = await response.json();
      if (response.ok && data.location) {
        setLocations((prev) =>
          prev.map((item) => (item.id === location.id ? data.location : item)),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  async function patchSortOrder(location: LocationRecord, nextOrder: number) {
    const session = getSessionUser();
    if (!session || !Number.isFinite(nextOrder)) return;
    setBusyId(location.id);
    try {
      const response = await adminFetch(
        `/api/admin/locations/${location.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: nextOrder }),
        },
      );
      const data = await response.json();
      if (response.ok && data.location) {
        setLocations((prev) =>
          prev
            .map((item) => (item.id === location.id ? data.location : item))
            .sort((a, b) => a.sortOrder - b.sortOrder),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(location: LocationRecord) {
    const session = getSessionUser();
    if (!session) return;
    setBusyId(location.id);
    try {
      const response = await adminFetch(
        `/api/admin/locations/${location.id}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setLocations((prev) => prev.filter((item) => item.id !== location.id));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate() {
    const session = getSessionUser();
    if (!session || !name.trim()) return;
    setCreating(true);
    try {
      const response = await adminFetch("/api/admin/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          emirate: emirate.trim() || undefined,
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
        }),
      });
      const data = await response.json();
      if (response.ok && data.location) {
        setLocations((prev) =>
          [...prev, data.location].sort((a, b) => a.sortOrder - b.sortOrder),
        );
        setName("");
        setEmirate("");
        setSortOrder("");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <LocalizedTree>
    <div className="grid gap-4">
      <Card className="p-5" variant="flat">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon name="plus" size={16} />
          إضافة موقع / مدينة
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Input
            label="اسم المدينة"
            onChange={(event) => setName(event.target.value)}
            placeholder="مثال: دبي"
            value={name}
          />
          <Input
            label="الإمارة (اختياري)"
            onChange={(event) => setEmirate(event.target.value)}
            placeholder="مثال: دبي"
            value={emirate}
          />
          <Input
            label="ترتيب العرض"
            onChange={(event) => setSortOrder(event.target.value)}
            placeholder="1"
            type="number"
            value={sortOrder}
          />
        </div>
        <div className="mt-4">
          <Button
            disabled={!name.trim()}
            loading={creating}
            onClick={handleCreate}
            size="sm"
            variant="primary"
          >
            حفظ الموقع
          </Button>
        </div>
      </Card>

      {locations.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد مواقع.</p>
        </Card>
      ) : (
        locations.map((location) => (
          <Card key={location.id} className="p-5" variant="flat">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{location.name}</p>
                {location.emirate ? (
                  <p className="mt-1 text-xs text-muted">{location.emirate}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={location.enabled ? "verified" : "rejected"}>
                    {location.enabled ? "مفعّل" : "معطّل"}
                  </Badge>
                  <label className="flex items-center gap-1 text-xs text-muted">
                    ترتيب
                    <input
                      className="w-16 rounded border border-border bg-surface px-2 py-1 text-ink"
                      defaultValue={location.sortOrder}
                      key={`${location.id}-${location.sortOrder}`}
                      onBlur={(event) => {
                        const next = Number(event.target.value);
                        if (next !== location.sortOrder) {
                          void patchSortOrder(location, next);
                        }
                      }}
                      type="number"
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  loading={busyId === location.id}
                  onClick={() => toggleEnabled(location)}
                  size="sm"
                  variant={location.enabled ? "ghost" : "secondary"}
                >
                  {location.enabled ? "تعطيل" : "تفعيل"}
                </Button>
                <Button
                  loading={busyId === location.id}
                  onClick={() => handleDelete(location)}
                  size="sm"
                  variant="ghost"
                >
                  حذف
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}

      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  </LocalizedTree>
  );
}
