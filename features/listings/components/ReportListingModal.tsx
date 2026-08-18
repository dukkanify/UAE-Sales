"use client";

import type { Listing } from "@/types";
import type { ListingReportReceipt } from "@/types/domain/listing-report";
import { LISTING_REPORT_REASON_LABELS } from "@/types/domain/listing-report";
import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { getSessionUser } from "@/services/storage";
import Link from "next/link";

type ReportListingModalProps = {
  listing: Listing;
  onClose: () => void;
  onSuccess: (receipt: ListingReportReceipt) => void;
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
  const [receipt, setReceipt] = useState<ListingReportReceipt | null>(null);
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
        credentials: "include",
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
      const nextReceipt = data.report as ListingReportReceipt | undefined;
      if (!nextReceipt?.id) {
        setError("تم الإرسال لكن تعذر عرض رقم البلاغ.");
        return;
      }
      setReceipt(nextReceipt);
      onSuccess(nextReceipt);
    } catch {
      setError("تعذر إرسال البلاغ. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setReceipt(null);
    setError("");
    onClose();
  }

  const statusHref =
    receipt?.publicToken
      ? `/report-status/${receipt.id}?token=${encodeURIComponent(receipt.publicToken)}`
      : null;

  return (
    <Modal
      onClose={handleClose}
      open={open}
      title={receipt ? "تم استلام البلاغ" : "إبلاغ عن الإعلان"}
    >
      {receipt ? (
        <div className="grid gap-3">
          <FormMessage variant="success">
            حفظنا هوية المُبلِغ حتى بدون تسجيل دخول. التفاصيل في لوحة الإدارة.
          </FormMessage>
          <dl className="grid gap-2 rounded-[var(--radius-xl)] border border-border bg-surface-muted px-4 py-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">رقم البلاغ</dt>
              <dd className="font-bold text-ink" dir="ltr">
                {receipt.id}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">المُبلِغ</dt>
              <dd className="font-semibold text-ink">
                {receipt.reporterName}
                {receipt.guest ? " (زائر)" : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">البريد</dt>
              <dd className="font-semibold text-ink" dir="ltr">
                {receipt.reporterEmail}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">الهاتف</dt>
              <dd className="font-semibold text-ink" dir="ltr">
                {receipt.reporterPhone}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">السبب</dt>
              <dd className="font-semibold text-ink">
                {LISTING_REPORT_REASON_LABELS[receipt.reason]}
              </dd>
            </div>
          </dl>
          <p className="text-sm text-muted">
            فريق الثقة يراجع البلاغ من{" "}
            <Link className="font-bold text-primary" href="/admin/listing-reports">
              لوحة التحكم → بلاغات الإعلانات
            </Link>
            .
          </p>
          {statusHref ? (
            <Button href={statusHref} variant="secondary">
              عرض ملخص بلاغي
            </Button>
          ) : null}
          <Button onClick={handleClose} type="button">
            إغلاق
          </Button>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={(event) => void handleSubmit(event)}>
          <p className="text-sm text-muted">
            حتى لو كنت زائرًا، نحتاج اسمك وبريدك وهاتفك حتى يعرف فريق الثقة من المُبلِغ.
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
              { label: LISTING_REPORT_REASON_LABELS.misleading, value: "misleading" },
              { label: LISTING_REPORT_REASON_LABELS.fraud, value: "fraud" },
              { label: LISTING_REPORT_REASON_LABELS.duplicate, value: "duplicate" },
              { label: LISTING_REPORT_REASON_LABELS.prohibited, value: "prohibited" },
              { label: LISTING_REPORT_REASON_LABELS.other, value: "other" },
            ]}
          />
          <Textarea label="تفاصيل إضافية (اختياري)" name="details" rows={3} />
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}
          <Button loading={isSubmitting} type="submit">
            إرسال البلاغ
          </Button>
        </form>
      )}
    </Modal>
  );
}
