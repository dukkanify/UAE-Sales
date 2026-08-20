"use client";

import type { Listing } from "@/types";
import { useEffect, useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { LISTING_ERRORS } from "@/shared/constants/listing-errors";
import { listingTitle } from "@/shared/i18n/listing-copy";
import { useLocale } from "@/shared/i18n/useLocale";
import { getSessionUser } from "@/services/storage";

type ViewingBookingModalProps = {
  listing: Listing;
  onClose: () => void;
  onSuccess: (bookingId: string, emailed: boolean) => void;
  open: boolean;
};

type Confirmation = {
  date: string;
  email: string;
  emailed: boolean;
  time: string;
};

export function ViewingBookingModal({
  listing,
  onClose,
  onSuccess,
  open,
}: ViewingBookingModalProps) {
  const displayTitle = listingTitle(listing, useLocale());
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dates, setDates] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/viewing-bookings/slots")
      .then((res) => res.json())
      .then((data) => {
        const nextDates = (data.dates as string[] | undefined) ?? [];
        setDates(nextDates);
        setSelectedDate((current) => current || nextDates[0] || "");
      })
      .catch(() => setDates([]));
  }, [open]);

  useEffect(() => {
    if (!selectedDate) return;
    fetch(
      `/api/viewing-bookings/slots?listingId=${encodeURIComponent(listing.id)}&date=${encodeURIComponent(selectedDate)}`,
    )
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]));
  }, [listing.id, selectedDate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const user = getSessionUser();
    if (!user) return;

    const form = new FormData(event.currentTarget);
    const buyerEmail = String(form.get("email") ?? user.email).trim();
    const date = String(form.get("date") ?? "");
    const time = String(form.get("time") ?? "");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/viewing-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          listingTitle: listing.title,
          listingSlug: listing.slug,
          buyerId: user.id,
          buyerName: String(form.get("fullName") ?? user.fullName),
          buyerEmail,
          phone: String(form.get("phone") ?? ""),
          date,
          time,
          visitors: Number(form.get("visitors") ?? 1),
          notes: String(form.get("notes") ?? ""),
          sellerId: listing.seller.id,
          sellerName: listing.seller.name,
        }),
      });

      const data = await response.json();
      if (response.status === 409) {
        setError(
          data.error === "SLOT_UNAVAILABLE"
            ? "هذا الموعد غير متاح. اختر وقتاً آخر."
            : "هذا الموعد محجوز أو لديك حجز مماثل.",
        );
        return;
      }
      if (response.status === 403) {
        setError(LISTING_ERRORS.ownListing);
        return;
      }
      if (response.status === 400) {
        setError("تحقق من التاريخ والبيانات المدخلة.");
        return;
      }
      if (!response.ok) {
        setError("تعذر حجز المعاينة.");
        return;
      }

      setConfirmation({
        date,
        time,
        email: buyerEmail,
        emailed: data.emailed === true,
      });
      onSuccess(data.booking.id, data.emailed === true);
    } catch {
      setError("تعذر حجز المعاينة.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const user = typeof window !== "undefined" ? getSessionUser() : null;

  return (
    <Modal
      description={`حجز معاينة: ${displayTitle}`}
      onClose={onClose}
      open={open}
      title="احجز معاينة"
    >
      {confirmation ? (
        <div className="grid gap-4">
          <FormMessage variant="success">
            {confirmation.emailed
              ? `تم تأكيد حجز المعاينة وأرسلنا التفاصيل إلى ${confirmation.email}.`
              : "تم تأكيد حجز المعاينة. يظهر الموعد في إشعارات حسابك."}
          </FormMessage>
          <dl className="grid gap-2 rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">التاريخ</dt>
              <dd className="font-semibold text-ink">{confirmation.date}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">الوقت</dt>
              <dd className="font-semibold text-ink">{confirmation.time}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">العقار</dt>
              <dd className="text-end font-semibold text-ink" data-ugc>
                {displayTitle}
              </dd>
            </div>
          </dl>
          <Button onClick={onClose} type="button">
            تم
          </Button>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={handleSubmit}>
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}
          <Input
            defaultValue={user?.fullName}
            label="الاسم الكامل"
            name="fullName"
            required
          />
          <Input
            defaultValue={user?.email}
            dir="ltr"
            label="البريد الإلكتروني"
            name="email"
            required
            type="email"
          />
          <Input
            defaultValue={user?.phone}
            dir="ltr"
            label="رقم الهاتف"
            name="phone"
            required
            type="tel"
          />
          <Select
            label="التاريخ"
            name="date"
            onChange={(event) => setSelectedDate(event.target.value)}
            options={dates.map((date) => ({ label: date, value: date }))}
            required
            value={selectedDate}
          />
          <Select
            label="الوقت"
            name="time"
            options={[
              { label: "اختر الوقت", value: "" },
              ...(selectedDate ? slots : []).map((slot) => ({
                label: slot,
                value: slot,
              })),
            ]}
            required
          />
          <Input
            defaultValue="1"
            label="عدد الزوار"
            max={10}
            min={1}
            name="visitors"
            required
            type="number"
          />
          <Textarea label="ملاحظات" name="notes" />
          <div className="flex gap-2">
            <Button loading={isSubmitting} type="submit" variant="accent">
              تأكيد الحجز
            </Button>
            <Button onClick={onClose} type="button" variant="secondary">
              إلغاء
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
