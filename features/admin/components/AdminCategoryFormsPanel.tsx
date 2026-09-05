"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useCallback, useEffect, useState } from "react";
import { getSessionUser } from "@/services/storage";
import { DYNAMIC_CATEGORY_IDS } from "@/shared/constants/category-fields";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";

type StoredField = {
  id?: string;
  fieldKey: string;
  label: string;
  type: string;
  required: boolean;
  enabled: boolean;
  sortOrder: number;
  placeholder?: string;
  note?: string;
  options?: { label: string; value: string }[];
  validation?: string;
};

type Suggestion = {
  id: string;
  categoryId: string;
  fieldKey: string;
  value: string;
  status: "pending" | "approved" | "rejected";
  requestedByName?: string;
  createdAt: string;
};

const TYPE_OPTIONS = [
  { label: "نص", value: "text" },
  { label: "رقم", value: "number" },
  { label: "قائمة", value: "select" },
  { label: "بحث", value: "combobox" },
  { label: "نص طويل", value: "textarea" },
  { label: "خيارات متعددة", value: "checkbox-group" },
];

export function AdminCategoryFormsPanel() {
  const [categoryId, setCategoryId] = useState<string>(DYNAMIC_CATEGORY_IDS[0]);
  const [fields, setFields] = useState<StoredField[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadFields = useCallback(async (id: string) => {
    const response = await adminFetch(
      `/api/admin/category-forms?categoryId=${encodeURIComponent(id)}`,
    );
    const data = await response.json();
    setFields(
      (data.fields ?? []).map(
        (field: StoredField & { fieldKey: string }, index: number) => ({
          fieldKey: field.fieldKey,
          label: field.label,
          type: field.type,
          required: Boolean(field.required),
          enabled: field.enabled !== false,
          sortOrder: field.sortOrder ?? index,
          placeholder: field.placeholder,
          note: field.note,
          options: field.options,
          validation: field.validation,
        }),
      ),
    );
  }, []);

  const loadSuggestions = useCallback(async () => {
    const response = await adminFetch("/api/admin/option-suggestions?status=pending");
    const data = await response.json();
    setSuggestions(data.items ?? []);
  }, []);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    let cancelled = false;
    void adminFetch(
      `/api/admin/category-forms?categoryId=${encodeURIComponent(categoryId)}`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setFields(
          (data.fields ?? []).map(
            (field: StoredField & { fieldKey: string }, index: number) => ({
              fieldKey: field.fieldKey,
              label: field.label,
              type: field.type,
              required: Boolean(field.required),
              enabled: field.enabled !== false,
              sortOrder: field.sortOrder ?? index,
              placeholder: field.placeholder,
              note: field.note,
              options: field.options,
              validation: field.validation,
            }),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setFields([]);
      });
    void adminFetch("/api/admin/option-suggestions?status=pending")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setSuggestions(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  async function saveFields() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await adminFetch("/api/admin/category-forms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, fields }),
      });
      if (!response.ok) {
        setMessage("تعذر حفظ النموذج.");
        return;
      }
      setMessage("تم حفظ حقول النموذج.");
      await loadFields(categoryId);
    } finally {
      setBusy(false);
    }
  }

  async function reviewSuggestion(id: string, status: "approved" | "rejected") {
    setBusy(true);
    try {
      await adminFetch("/api/admin/option-suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await loadSuggestions();
      if (status === "approved") await loadFields(categoryId);
    } finally {
      setBusy(false);
    }
  }

  function updateField(index: number, patch: Partial<StoredField>) {
    setFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, ...patch } : field)),
    );
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      {
        fieldKey: `custom_${prev.length + 1}`,
        label: "حقل جديد",
        type: "text",
        required: false,
        enabled: true,
        sortOrder: prev.length,
      },
    ]);
  }

  return (
    <div className="grid gap-5">
      <Card className="grid gap-3 p-5" variant="flat">
        <h3 className="text-base font-bold text-ink">منشئ النماذج الديناميكية</h3>
        <p className="text-sm text-muted">
          عدّل حقول إضافة/تعديل الإعلان حسب التصنيف دون تغيير الكود. التغييرات تُحفظ في قاعدة
          البيانات.
        </p>
        <Select
          label="التصنيف"
          onChange={(event) => setCategoryId(event.target.value)}
          options={DYNAMIC_CATEGORY_IDS.map((id) => ({ label: id, value: id }))}
          value={categoryId}
        />
        <div className="grid gap-3">
          {fields.map((field, index) => (
            <div
              key={`${field.fieldKey}-${index}`}
              className="grid gap-2 rounded-[var(--radius-xl)] border border-border p-3 sm:grid-cols-2"
            >
              <Input
                label="المفتاح"
                onChange={(event) =>
                  updateField(index, { fieldKey: event.target.value })
                }
                value={field.fieldKey}
              />
              <Input
                label="التسمية"
                onChange={(event) => updateField(index, { label: event.target.value })}
                value={field.label}
              />
              <Select
                label="النوع"
                onChange={(event) => updateField(index, { type: event.target.value })}
                options={TYPE_OPTIONS}
                value={field.type}
              />
              <Input
                label="الترتيب"
                onChange={(event) =>
                  updateField(index, {
                    sortOrder: Number(event.target.value) || 0,
                  })
                }
                type="number"
                value={String(field.sortOrder)}
              />
              <Input
                label="خيارات القائمة (label:value مفصولة بفاصلة)"
                onChange={(event) => {
                  const options = event.target.value
                    .split(",")
                    .map((part) => part.trim())
                    .filter(Boolean)
                    .map((part) => {
                      const [label, value] = part.split(":").map((s) => s.trim());
                      return { label: label || part, value: value || label || part };
                    });
                  updateField(index, { options });
                }}
                placeholder="غرف نوم:غرف نوم, كنب:كنب"
                value={(field.options ?? [])
                  .map((option) => `${option.label}:${option.value}`)
                  .join(", ")}
              />
              <Input
                label="التحقق / الملاحظة"
                onChange={(event) =>
                  updateField(index, {
                    validation: event.target.value,
                    note: event.target.value,
                  })
                }
                value={field.validation ?? field.note ?? ""}
              />
              <label className="flex items-center gap-2 text-xs text-ink">
                <input
                  checked={field.required}
                  onChange={(event) =>
                    updateField(index, { required: event.target.checked })
                  }
                  type="checkbox"
                />
                مطلوب
              </label>
              <label className="flex items-center gap-2 text-xs text-ink">
                <input
                  checked={field.enabled}
                  onChange={(event) =>
                    updateField(index, { enabled: event.target.checked })
                  }
                  type="checkbox"
                />
                مفعّل / ظاهر
              </label>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={addField} size="sm" type="button" variant="secondary">
            إضافة حقل
          </Button>
          <Button loading={busy} onClick={() => void saveFields()} size="sm" type="button">
            حفظ النموذج
          </Button>
        </div>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </Card>

      <Card className="grid gap-3 p-5" variant="flat">
        <h3 className="text-base font-bold text-ink">اقتراحات قيم «أخرى»</h3>
        <p className="text-sm text-muted">
          عند اختيار المستخدم «أخرى» وكتابة قيمة مخصصة، تصل هنا للموافقة قبل ظهورها في القوائم.
        </p>
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted">لا توجد اقتراحات معلّقة.</p>
        ) : (
          suggestions.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-border p-3"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{item.value}</p>
                <p className="text-xs text-muted">
                  {item.categoryId}.{item.fieldKey} · {item.requestedByName ?? "مستخدم"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  loading={busy}
                  onClick={() => void reviewSuggestion(item.id, "approved")}
                  size="sm"
                  type="button"
                >
                  موافقة
                </Button>
                <Button
                  loading={busy}
                  onClick={() => void reviewSuggestion(item.id, "rejected")}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  رفض
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
