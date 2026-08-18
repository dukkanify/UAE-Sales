"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { DisputeReasonCode } from "@/types";
import type { Order } from "@/types";
import type { DisputeWindow } from "@/services/payments/dispute-window";
import { formatRemainingDays } from "@/services/payments/dispute-window";
import { DISPUTE_REASON_OPTIONS } from "@/shared/constants/disputes";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { Textarea } from "@/shared/ui/Textarea";
import { Input } from "@/shared/ui/Input";

type OpenDisputeFormProps = {
  onOpened?: () => void;
  order: Order;
  window: DisputeWindow;
};

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "يجب تسجيل الدخول كمشتري لهذا الطلب.",
  ORDER_NOT_FOUND: "لم يتم العثور على الطلب.",
  INVALID_STATUS: "لا يمكن فتح نزاع على حالة هذا الطلب.",
  DISPUTE_WINDOW_CLOSED: "انتهت مهلة فتح النزاع لهذا الطلب.",
  INVALID_REASON: "اكتب سبباً أوضح للنزاع (١٠ أحرف على الأقل).",
  INVALID_INPUT: "تحقق من البيانات المدخلة.",
};

export function OpenDisputeForm({ onOpened, order, window }: OpenDisputeFormProps) {
  const router = useRouter();
  const [reasonCode, setReasonCode] = useState<DisputeReasonCode>("not_as_described");
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = useMemo(
    () => DISPUTE_REASON_OPTIONS.find((item) => item.code === reasonCode),
    [reasonCode],
  );

  const progress = Math.max(
    0,
    Math.min(100, Math.round((window.remainingMs / (window.windowDays * 86400000)) * 100)),
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const user = getSessionUser();
    if (!user) {
      router.push(`/login?next=/dashboard/disputes?orderId=${encodeURIComponent(order.id)}`);
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
      const response = await fetch(`/api/orders/${order.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: trimmed,
          reasonCode,
          evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const code = typeof data?.error === "string" ? data.error : "UNKNOWN";
        setError(ERROR_MESSAGES[code] ?? "تعذر فتح النزاع. حاول مرة أخرى.");
        return;
      }
      onOpened?.();
      router.refresh();
    } catch {
      setError("تعذر فتح النزاع. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-secondary/40 bg-secondary-soft/40 p-5" variant="flat">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-secondary">فتح نزاع بسهولة</p>
          <h3 className="mt-1 text-base font-black text-ink">{order.listingTitle}</h3>
          <p className="mt-1 text-xs text-muted">طلب {order.id}</p>
        </div>
        <CurrencyAmount amount={order.fees.total} size="md" />
      </div>

      <div className="mt-4 rounded-[var(--radius-xl)] border border-border/70 bg-surface p-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-ink">المهلة المتبقية للفتح</span>
          <span className="text-secondary">
            {formatRemainingDays(window.remainingDays)} من {window.windowDays}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#d4b87a] to-[#c9a962]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-[0.7rem] text-muted">
          ينتهي في {new Date(window.closesAt).toLocaleDateString("ar-AE")} · رد البائع خلال{" "}
          {window.responseDays} أيام بعد الفتح
        </p>
      </div>

      <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink">ما المشكلة؟</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {DISPUTE_REASON_OPTIONS.map((item) => {
              const active = item.code === reasonCode;
              return (
                <button
                  className={`rounded-[var(--radius-xl)] border px-3 py-2.5 text-start text-sm font-semibold transition ${
                    active
                      ? "border-secondary bg-secondary-soft text-ink"
                      : "border-border bg-surface text-muted hover:border-secondary/40"
                  }`}
                  key={item.code}
                  onClick={() => setReasonCode(item.code)}
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          {selected ? (
            <p className="mt-2 text-xs text-muted">{selected.hint}</p>
          ) : null}
        </fieldset>

        <Textarea
          hint="اشرح بوضوح ماذا حدث (١٠ أحرف على الأقل)."
          label="تفاصيل النزاع"
          minLength={10}
          onChange={(event) => setReason(event.target.value)}
          placeholder="مثال: وصلت السلعة بخدوش غير مذكورة في الإعلان..."
          required
          value={reason}
        />
        <Input
          hint="روابط صور أو مستندات، مفصولة بفاصلة أو سطر جديد."
          label="أدلة (اختياري)"
          onChange={(event) => setEvidenceUrl(event.target.value)}
          placeholder="https://..."
          value={evidenceUrl}
        />

        <ul className="grid gap-1.5 text-xs text-muted">
          <li className="flex items-center gap-2">
            <Icon className="text-secondary" name="shield" size={13} />
            يبقى المبلغ محجوزاً في الضمان حتى قرار الإدارة.
          </li>
          <li className="flex items-center gap-2">
            <Icon className="text-secondary" name="bell" size={13} />
            نرسل تنبيهاً فورياً للبائع ولقسم النزاعات.
          </li>
          <li className="flex items-center gap-2">
            <Icon className="text-secondary" name="clock" size={13} />
            البائع لديه {window.responseDays} أيام للرد من لوحة التحكم.
          </li>
        </ul>

        {error ? <FormMessage variant="error">{error}</FormMessage> : null}

        <Button loading={isSubmitting} size="lg" type="submit" variant="accent">
          <Icon name="shield" size={16} />
          تأكيد فتح النزاع
        </Button>
      </form>
    </Card>
  );
}
