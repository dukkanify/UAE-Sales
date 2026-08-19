"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

type NewDisputeFormProps = {
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

export function NewDisputeForm({ orderId }: NewDisputeFormProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const user = getSessionUser();
    if (!user) {
      router.push(`/login?next=/disputes/new?orderId=${encodeURIComponent(orderId)}`);
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
      const response = await fetch(`/api/orders/${orderId}/dispute`, {
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
      router.push(`/orders/${orderId}`);
    } catch {
      setError("تعذر فتح النزاع. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!orderId) {
    return (
<LocalizedTree>
      <Card className="p-6" variant="flat">
        <FormMessage variant="error">
          أضف رقم الطلب عبر الرابط، مثال: /disputes/new?orderId=...
        </FormMessage>
      </Card>
    </LocalizedTree>
);
  }

  return (
<LocalizedTree>
    <Card className="p-6" variant="flat">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input
          disabled
          label="رقم الطلب"
          readOnly
          value={orderId}
        />
        <Textarea
          label="سبب النزاع"
          hint="اشرح المشكلة بوضوح (١٠ أحرف على الأقل)."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          required
          minLength={10}
          placeholder="مثال: المنتج وصل بحالة مختلفة عن الوصف..."
        />
        <Input
          label="روابط أدلة (اختياري)"
          hint="يمكنك إدخال أكثر من رابط مفصول بفاصلة أو سطر جديد."
          value={evidenceUrl}
          onChange={(event) => setEvidenceUrl(event.target.value)}
          placeholder="https://..."
        />
        {error ? <FormMessage variant="error">{error}</FormMessage> : null}
        {success ? <FormMessage variant="success">{success}</FormMessage> : null}
        <Button loading={isSubmitting} size="lg" type="submit" variant="accent">
          فتح النزاع
        </Button>
      </form>
    </Card>
  </LocalizedTree>
);
}
