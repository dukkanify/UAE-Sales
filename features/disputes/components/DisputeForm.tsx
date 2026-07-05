"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { DisputeReason, DisputeResolution } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { createDisputeClient } from "@/services/orders/orders.client";

const reasonOptions = [
  { value: "not_received", label: "لم أستلم المنتج" },
  { value: "not_as_described", label: "المنتج مختلف عن الوصف" },
  { value: "damaged", label: "المنتج تالف" },
  { value: "wrong_item", label: "منتج خاطئ" },
  { value: "seller_unresponsive", label: "البائع لا يستجيب" },
  { value: "other", label: "سبب آخر" },
];

const resolutionOptions = [
  { value: "full_refund", label: "استرداد كامل" },
  { value: "partial_refund", label: "استرداد جزئي" },
  { value: "replacement", label: "استبدال المنتج" },
  { value: "release_to_seller", label: "إطلاق المبلغ للبائع" },
];

export function DisputeForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState<DisputeReason>("not_as_described");
  const [preferredResolution, setPreferredResolution] =
    useState<DisputeResolution>("full_refund");
  const [description, setDescription] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");

  const { error, isLoading, run: submitDispute } = useAsyncAction(
    useCallback(async () => {
      if (!orderId) {
        throw new Error("معرّف الطلب مطلوب.");
      }
      if (description.trim().length < 10) {
        throw new Error("يرجى وصف المشكلة بتفصيل أكبر.");
      }

      await createDisputeClient({
        orderId,
        reason,
        description: description.trim(),
        preferredResolution,
        evidenceNote: evidenceNote.trim() || undefined,
      });

      setSubmitted(true);
    }, [description, evidenceNote, orderId, preferredResolution, reason]),
  );

  if (submitted) {
    return (
      <Card className="marketplace-panel p-8 text-center" variant="flat">
        <FormMessage variant="success">
          تم تسجيل النزاع بنجاح. سيراجعه فريق الدعم خلال 48 ساعة.
        </FormMessage>
        <Button
          className="mt-4"
          href={orderId ? `/orders/${orderId}` : "/orders"}
          variant="primary"
        >
          العودة للطلب
        </Button>
      </Card>
    );
  }

  return (
    <Card className="marketplace-panel p-6" variant="flat">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submitDispute();
        }}
      >
        <Input
          disabled
          label="رقم الطلب"
          name="orderId"
          value={orderId || "غير محدد"}
        />

        <Select
          label="سبب النزاع"
          onChange={(event) =>
            setReason(event.target.value as DisputeReason)
          }
          options={reasonOptions}
          value={reason}
        />

        <Textarea
          label="وصف المشكلة"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="اشرح المشكلة بالتفصيل..."
          required
          rows={4}
          value={description}
        />

        <Input
          label="الأدلة (وصف المرفقات)"
          onChange={(event) => setEvidenceNote(event.target.value)}
          placeholder="صور المنتج، محادثات، إيصالات..."
          value={evidenceNote}
        />

        <Select
          label="الحل المفضل"
          onChange={(event) =>
            setPreferredResolution(event.target.value as DisputeResolution)
          }
          options={resolutionOptions}
          value={preferredResolution}
        />

        {error ? <FormMessage variant="error">{error}</FormMessage> : null}

        <Button fullWidth loading={isLoading} type="submit" variant="gold">
          إرسال النزاع
        </Button>
      </form>
    </Card>
  );
}
