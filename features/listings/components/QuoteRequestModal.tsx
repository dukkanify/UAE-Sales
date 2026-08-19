"use client";

import type { Listing } from "@/types";
import type { QuoteRequestKind } from "@/types/domain/quote-request";
import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { LISTING_ERRORS } from "@/shared/constants/listing-errors";
import { getSessionUser } from "@/services/storage";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

type QuoteRequestModalProps = {
  kind?: QuoteRequestKind;
  listing: Listing;
  onClose: () => void;
  onSuccess: (requestId: string, emailed: boolean) => void;
  open: boolean;
};

function getDefaultPreferredDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

function buildDefaultDescription(listingTitle: string, isBooking: boolean, notes: string) {
  if (notes.length >= 10) return notes;

  const fallback = isBooking
    ? `طلب حجز خدمة «${listingTitle}»`
    : `طلب عرض سعر لخدمة «${listingTitle}»`;

  return notes ? `${fallback} — ${notes}` : fallback;
}

export function QuoteRequestModal({
  kind = "quote",
  listing,
  onClose,
  onSuccess,
  open,
}: QuoteRequestModalProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBooking = kind === "service_booking";
  const title = isBooking ? "احجز الخدمة" : "طلب عرض سعر";
  const user = typeof window !== "undefined" ? getSessionUser() : null;
  const minDate = getDefaultPreferredDate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const user = getSessionUser();
    if (!user) return;

    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    if (phone.length < 8) {
      setError("أدخل رقم هاتف صحيح للتواصل.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          listingId: listing.id,
          listingTitle: listing.title,
          listingSlug: listing.slug,
          requesterId: user.id,
          requesterName: user.fullName,
          requesterEmail: user.email,
          phone,
          serviceRequired: listing.title,
          description: buildDefaultDescription(listing.title, isBooking, notes),
          emirate: listing.emirate ?? listing.city ?? user.city ?? "دبي",
          area: listing.area ?? "غير محدد",
          preferredDate: isBooking
            ? String(form.get("preferredDate") ?? "")
            : minDate,
          preferredTime: isBooking
            ? String(form.get("preferredTime") ?? "")
            : "10:00",
          providerId: listing.seller.id,
          providerName: listing.seller.name,
        }),
      });

      const data = await response.json();
      if (response.status === 409) {
        setError("لديك طلب مفتوح لهذا الإعلان خلال الأيام السبعة الماضية.");
        return;
      }
      if (response.status === 403) {
        setError(LISTING_ERRORS.ownListing);
        return;
      }
      if (response.status === 400) {
        setError("تحقق من البيانات وأعد المحاولة.");
        return;
      }
      if (!response.ok) {
        setError("تعذر إرسال الطلب.");
        return;
      }

      setSuccess(true);
      setEmailed(data.emailed === true);
      onSuccess(data.quoteRequest.id, data.emailed === true);
    } catch {
      setError("تعذر إرسال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
<LocalizedTree>
    <Modal
      description={listing.title}
      onClose={onClose}
      open={open}
      title={title}
    >
      {success ? (
        <div className="grid gap-4">
          <FormMessage variant="success">
            {emailed
              ? isBooking
                ? "تم إرسال طلب الحجز وأرسلنا تأكيدًا إلى بريدك. سيتواصل مزود الخدمة معك قريبًا."
                : "تم إرسال طلبك وأرسلنا تأكيدًا إلى بريدك. سيتواصل مزود الخدمة معك قريبًا."
              : isBooking
                ? "تم إرسال طلب الحجز. يظهر في إشعارات حسابك وسيتواصل مزود الخدمة معك قريبًا."
                : "تم إرسال طلبك. يظهر في إشعارات حسابك وسيتواصل مزود الخدمة معك قريبًا."}
          </FormMessage>
          <Button onClick={onClose} type="button">
            تم
          </Button>
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}

          <p className="rounded-[var(--radius-xl)] border border-border/70 bg-surface-muted/60 px-4 py-3 text-sm leading-6 text-muted">
            {isBooking
              ? "اختر الموعد المناسب وأرسل رقمك — نكمل الباقي نيابةً عنك."
              : "أرسل رقمك فقط — نرجع لك بالعرض بأسرع وقت."}
          </p>

          <Input
            autoComplete="tel"
            defaultValue={user?.phone}
            hint="سيستخدم مزود الخدمة هذا الرقم للتواصل معك"
            inputMode="tel"
            label="رقم الهاتف"
            name="phone"
            placeholder="05xxxxxxxx"
            required
            type="tel"
          />

          {isBooking ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="التاريخ"
                min={minDate}
                name="preferredDate"
                required
                type="date"
              />
              <Input label="الوقت" name="preferredTime" required type="time" />
            </div>
          ) : null}

          <Textarea
            className="min-h-24"
            hint="اختياري — أضف أي تفاصيل تهمك"
            label="ملاحظة سريعة"
            name="notes"
            placeholder="مثال: أفضل التواصل واتساب بعد المغرب"
            rows={3}
          />

          <div className="grid gap-2 pt-1">
            <Button fullWidth loading={isSubmitting} type="submit" variant="accent">
              {isBooking ? "تأكيد الحجز" : "إرسال الطلب"}
            </Button>
            <Button fullWidth onClick={onClose} type="button" variant="secondary">
              إلغاء
            </Button>
          </div>
        </form>
      )}
    </Modal>
  </LocalizedTree>
);
}
