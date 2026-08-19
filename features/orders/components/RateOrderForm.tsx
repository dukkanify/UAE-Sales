"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Textarea } from "@/shared/ui/Textarea";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

type RateOrderFormProps = {
  orderId: string;
  onRated?: () => void;
};

export function RateOrderForm({ orderId, onRated }: RateOrderFormProps) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          comment: comment.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(
          data.error === "ALREADY_RATED"
            ? "لقد قيّمت هذا الطلب مسبقاً."
            : data.error === "INVALID_STATUS"
              ? "يمكن التقييم بعد اكتمال التحويل فقط."
              : "تعذر إرسال التقييم.",
        );
        return;
      }
      setSuccess("شكراً لك، تم إرسال تقييمك.");
      onRated?.();
    } catch {
      setError("تعذر إرسال التقييم.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
<LocalizedTree>
    <form
      className="grid gap-4 rounded-[var(--radius-2xl)] border border-border bg-surface p-5"
      onSubmit={handleSubmit}
    >
      <div>
        <h3 className="text-sm font-semibold text-ink">تقييم البائع</h3>
        <p className="mt-1 text-xs text-muted">
          قيّم تجربتك بعد اكتمال الطلب لمساعدة المشترين الآخرين.
        </p>
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium text-ink">التقييم</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              aria-pressed={score === value}
              className={`min-h-10 min-w-10 rounded-[var(--radius-xl)] border text-sm font-semibold transition ${
                score === value
                  ? "border-secondary bg-secondary text-primary"
                  : "border-border bg-surface-muted text-ink hover:border-secondary"
              }`}
              onClick={() => setScore(value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <Textarea
        label="تعليق (اختياري)"
        onChange={(event) => setComment(event.target.value)}
        placeholder="اكتب ملاحظاتك عن البائع..."
        value={comment}
      />

      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
      {success ? <FormMessage variant="success">{success}</FormMessage> : null}

      {!success ? (
        <Button loading={isSubmitting} size="md" type="submit" variant="accent">
          إرسال التقييم
        </Button>
      ) : null}
    </form>
  </LocalizedTree>
);
}
