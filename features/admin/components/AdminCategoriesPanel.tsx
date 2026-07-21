"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminCategoryRecord } from "@/types";
import { getSessionUser } from "@/services/storage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { Input } from "@/shared/ui/Input";

export function AdminCategoriesPanel() {
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/categories", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  async function toggleEnabled(category: AdminCategoryRecord) {
    const session = getSessionUser();
    if (!session) return;
    setBusyId(category.id);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "admin",
        },
        body: JSON.stringify({ enabled: !category.enabled }),
      });
      const data = await response.json();
      if (response.ok && data.category) {
        setCategories((prev) =>
          prev.map((item) =>
            item.id === category.id ? data.category : item,
          ),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate() {
    const session = getSessionUser();
    if (!session || !name.trim() || !slug.trim()) return;
    setCreating(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "admin",
        },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.category) {
        setCategories((prev) => [data.category, ...prev]);
        setName("");
        setSlug("");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Card className="p-5" variant="flat">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon name="plus" size={16} />
          إضافة فئة
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="اسم الفئة"
            onChange={(event) => setName(event.target.value)}
            placeholder="مثال: مستلزمات مكتبية"
            value={name}
          />
          <Input
            label="المعرّف (slug)"
            onChange={(event) => setSlug(event.target.value)}
            placeholder="office-supplies"
            value={slug}
          />
        </div>
        <div className="mt-4">
          <Button
            disabled={!name.trim() || !slug.trim()}
            loading={creating}
            onClick={handleCreate}
            size="sm"
            variant="primary"
          >
            حفظ الفئة
          </Button>
        </div>
      </Card>

      {categories.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد فئات.</p>
        </Card>
      ) : (
        categories.map((category) => (
          <Card key={category.id} className="p-5" variant="flat">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{category.name}</p>
                <p className="mt-1 text-xs text-muted">{category.slug}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={category.enabled ? "verified" : "rejected"}>
                    {category.enabled ? "مفعّلة" : "معطّلة"}
                  </Badge>
                  <Badge variant="muted">
                    {category.listingCount.toLocaleString("ar-AE")} إعلان
                  </Badge>
                </div>
                {category.subcategories.length > 0 ? (
                  <p className="mt-2 text-xs text-muted">
                    {category.subcategories.slice(0, 4).join(" · ")}
                    {category.subcategories.length > 4 ? "…" : ""}
                  </p>
                ) : null}
              </div>
              <Button
                loading={busyId === category.id}
                onClick={() => toggleEnabled(category)}
                size="sm"
                variant={category.enabled ? "ghost" : "secondary"}
              >
                {category.enabled ? "تعطيل" : "تفعيل"}
              </Button>
            </div>
          </Card>
        ))
      )}

      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
