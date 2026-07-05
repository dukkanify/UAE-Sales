"use client";

import { useEffect, useState } from "react";
import type { AdminCategoryRecord } from "@/types/domain/admin";
import { AdminLoading } from "@/features/admin/components/AdminLoading";
import {
  addAdminCategoryClient,
  fetchAdminCategories,
  updateAdminCategoryClient,
} from "@/services/admin";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

export function AdminCategoriesPanel() {
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchAdminCategories()
        .then(setCategories)
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function handleAdd() {
    if (!newName.trim()) {
      return;
    }
    setActionLoading(true);
    const created = await addAdminCategoryClient(newName.trim());
    setCategories((items) => [created, ...items]);
    setNewName("");
    setActionLoading(false);
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) {
      return;
    }
    setActionLoading(true);
    const updated = await updateAdminCategoryClient(id, { name: editName.trim() });
    if (updated) {
      setCategories((items) => items.map((item) => (item.id === id ? updated : item)));
    }
    setEditingId(null);
    setActionLoading(false);
  }

  async function handleDisable(id: string, disabled: boolean) {
    setActionLoading(true);
    const updated = await updateAdminCategoryClient(id, { disabled });
    if (updated) {
      setCategories((items) => items.map((item) => (item.id === id ? updated : item)));
    }
    setActionLoading(false);
  }

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <Card className="marketplace-panel p-6" variant="flat">
      <div className="flex flex-wrap gap-3">
        <input
          className="min-w-[12rem] flex-1 rounded-[var(--radius-xl)] border border-border bg-surface px-4 py-2.5 text-sm"
          onChange={(event) => setNewName(event.target.value)}
          placeholder="اسم التصنيف الجديد"
          value={newName}
        />
        <Button disabled={actionLoading} onClick={handleAdd} variant="primary">
          إضافة تصنيف
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            description="أضف تصنيفاً جديداً للبدء."
            icon="package"
            title="لا توجد تصنيفات"
          />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-muted">
                <th className="px-3 py-2 font-medium">التصنيف</th>
                <th className="px-3 py-2 font-medium">الإعلانات</th>
                <th className="px-3 py-2 font-medium">الحالة</th>
                <th className="px-3 py-2 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border/60">
                  <td className="px-3 py-3">
                    {editingId === category.id ? (
                      <input
                        className="w-full rounded-[var(--radius-lg)] border border-border px-3 py-1.5 text-sm"
                        onChange={(event) => setEditName(event.target.value)}
                        value={editName}
                      />
                    ) : (
                      <p className="font-medium text-ink">{category.name}</p>
                    )}
                    <p className="text-xs text-muted">{category.slug}</p>
                  </td>
                  <td className="px-3 py-3">
                    {category.listingCount.toLocaleString("ar-AE")}
                  </td>
                  <td className="px-3 py-3">
                    {category.disabled ? (
                      <Badge variant="rejected">معطّل</Badge>
                    ) : (
                      <Badge variant="verified">نشط</Badge>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {editingId === category.id ? (
                        <Button
                          disabled={actionLoading}
                          onClick={() => handleEdit(category.id)}
                          size="sm"
                          variant="primary"
                        >
                          حفظ
                        </Button>
                      ) : (
                        <Button
                          disabled={actionLoading}
                          onClick={() => {
                            setEditingId(category.id);
                            setEditName(category.name);
                          }}
                          size="sm"
                          variant="secondary"
                        >
                          تعديل
                        </Button>
                      )}
                      <Button
                        disabled={actionLoading}
                        onClick={() =>
                          handleDisable(category.id, !category.disabled)
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {category.disabled ? "تفعيل" : "تعطيل"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
