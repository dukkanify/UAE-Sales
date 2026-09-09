"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Order } from "@/types";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";

type NewDisputeFormProps = {
  listingId?: string;
  orderId: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "يجب تسجيل الدخول كمشتري لهذا الطلب.",
  ORDER_NOT_FOUND: "لم يتم العثور على الطلب.",
  INVALID_STATUS: "لا يمكن فتح نزاع على حالة هذا الطلب.",
  DISPUTE_WINDOW_CLOSED: "انتهت مهلة فتح النزاع لهذا الطلب.",
  INVALID_REASON: "اكتب سبباً أوضح للنزاع (١٠ أحرف على الأقل).",
  INVALID_INPUT: "تحقق من البيانات المدخلة.",
};

const DISPUTABLE_STATUSES: Order["status"][] = [
  "paid_held_in_escrow",
  "delivered",
  "confirmed",
];

export function NewDisputeForm({ listingId = "", orderId }: NewDisputeFormProps) {
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState(orderId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    if (!user) return;
    fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => {
        const rows = (data.orders ?? []) as Order[];
        setOrders(rows);
        if (orderId) return;
        const matching = rows.filter(
          (row) =>
            (!listingId || row.listingId === listingId) &&
            DISPUTABLE_STATUSES.includes(row.status),
        );
        if (matching[0]) setSelectedOrderId(matching[0].id);
      })
      .catch(() => setOrders([]));
  }, [listingId, orderId]);

  const listingOrders = useMemo(() => {
    const source = listingId
      ? orders.filter((row) => row.listingId === listingId)
      : orders;
    return source.filter((row) => DISPUTABLE_STATUSES.includes(row.status));
  }, [listingId, orders]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const targetOrderId = selectedOrderId.trim();
    const user = getSessionUser();
    if (!user) {
      const next = listingId
        ? `/disputes/new?listingId=${encodeURIComponent(listingId)}`
        : `/disputes/new?orderId=${encodeURIComponent(targetOrderId)}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (!targetOrderId) {
      setError("اختر الطلب المراد فتح النزاع عليه.");
      return;
    }

    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setError(ERROR_MESSAGES.INVALID_REASON);
      return;
    }

    const evidenceUrls = evidenceUrl
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${targetOrderId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: trimmed,
          evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const code = typeof data?.error === "string" ? data.error : "UNKNOWN";
        setError(ERROR_MESSAGES[code] ?? "تعذر فتح النزاع. حاول مرة أخرى.");
        return;
      }

      setSuccess("تم فتح النزاع بنجاح. يمكنك متابعة حالة الطلب من صفحة الطلب.");
      router.push(`/orders/${targetOrderId}`);
    } catch {
      setError("تعذر فتح النزاع. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6" variant="flat">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {listingOrders.length > 0 ? (
          <Select
            label="الطلب"
            name="orderId"
            onChange={(event) => setSelectedOrderId(event.target.value)}
            options={listingOrders.map((row) => ({
              label: `${row.listingTitle} — ${row.id}`,
              value: row.id,
            }))}
            required
            value={selectedOrderId}
          />
        ) : (
          <Input
            hint={
              listingId
                ? "أدخل رقم الطلب المدفوع عبر الضمان لهذا الإعلان."
                : "أدخل رقم الطلب من صفحة طلباتي."
            }
            label="رقم الطلب"
            onChange={(event) => setSelectedOrderId(event.target.value)}
            placeholder="order-..."
            required
            value={selectedOrderId}
          />
        )}
        {listingId && listingOrders.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-muted">
            لا يوجد طلب ضمان مفتوح لهذا الإعلان في حسابك. يمكنك إدخال رقم الطلب يدوياً أو
            مراجعة{" "}
            <Link className="font-bold text-ink underline" href="/orders">
              طلباتي
            </Link>
            .
          </p>
        ) : null}
        <Textarea
          hint="اشرح المشكلة بوضوح (١٠ أحرف على الأقل)."
          label="سبب النزاع"
          minLength={10}
          onChange={(event) => setReason(event.target.value)}
          placeholder="مثال: المنتج وصل بحالة مختلفة عن الوصف..."
          required
          value={reason}
        />
        <Input
          hint="يمكنك إدخال أكثر من رابط مفصول بفاصلة أو سطر جديد."
          label="روابط أدلة (اختياري)"
          onChange={(event) => setEvidenceUrl(event.target.value)}
          placeholder="https://..."
          value={evidenceUrl}
        />
        {error ? <FormMessage variant="error">{error}</FormMessage> : null}
        {success ? <FormMessage variant="success">{success}</FormMessage> : null}
        <Button loading={isSubmitting} size="lg" type="submit" variant="accent">
          فتح النزاع
        </Button>
      </form>
    </Card>
  );
}
