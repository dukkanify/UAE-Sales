"use client";

import type { Listing } from "@/types";
import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { getSessionUser } from "@/services/storage";

type ReportListingModalProps = {
  listing: Listing;
  onClose: () => void;
  onSuccess: (guest: boolean) => void;
  open: boolean;
};

export function ReportListingModal({
  listing,
  onClose,
  onSuccess,
  open,
}: ReportListingModalProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = typeof window !== "undefined" ? getSessionUser() : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const reporterName = String(form.get("reporterName") ?? "").trim();
    const reporterEmail = String(form.get("reporterEmail") ?? "").trim();
    const reporterPhone = String(form.get("reporterPhone") ?? "").trim();
    const reason = String(form.get("reason") ?? "");
    const details = String(form.get("details") ?? "").trim();

    if (reporterName.length < 2 || !reporterEmail.includes("@") || reporterPhone.length < 8) {
      setError("أدخل اسمك وبريدك ورقم هاتف صحيح حتى نعرف المُبلِغ.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/listing-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          reason,
          details,
          reporterName,
          reporterEmail,
          reporterPhone,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "تعذر إرسال البلاغ. حاول مرة أخرى.");
        return;
      }
      onSuccess(!getSessionUser());
    } catch {
      setError("تعذر إرسال البلاغ. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} open={open} title="إبلاغ عن الإعلان">
      <form className="grid gap-3" onSubmit={(event) => void handleSubmit(event)}>
        <p className="text-sm text-muted">
          حتى لو كنت زائرًا، نحتاج اسمك وبريدك وهاتفك لمتابعة البلاغ في لوحة الإدارة.
        </p>
        <Input
          defaultValue={user?.fullName}
          label="الاسم"
          name="reporterName"
          required
        />
        <Input
          defaultValue={user?.email}
          label="البريد الإلكتروني"
          name="reporterEmail"
          required
          type="email"
        />
        <Input
          defaultValue={user?.phone}
          dir="ltr"
          label="رقم الهاتف"
          name="reporterPhone"
          required
          type="tel"
        />
        <Select
          label="سبب البلاغ"
          name="reason"
          options={[
            { label: "محتوى مضلل", value: "misleading" },
            { label: "احتيال أو نصب", value: "fraud" },
            { label: "إعلان مكرر", value: "duplicate" },
            { label: "محتوى ممنوع", value: "prohibited" },
            { label: "سبب آخر", value: "other" },
          ]}
        />
        <Textarea label="تفاصيل إضافية (اختياري)" name="details" rows={3} />
        {error ? <FormMessage variant="error">{error}</FormMessage> : null}
        <Button loading={isSubmitting} type="submit">
          إرسال البلاغ
        </Button>
      </form>
    </Modal>
  );
}
