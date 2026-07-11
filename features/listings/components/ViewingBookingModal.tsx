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
import { getSessionUser } from "@/services/storage";

type ViewingBookingModalProps = {
  listing: Listing;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
  open: boolean;
};

export function ViewingBookingModal({
  listing,
  onClose,
  onSuccess,
  open,
}: ViewingBookingModalProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dates, setDates] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/viewing-bookings/slots")
      .then((res) => res.json())
      .then((data) => setDates(data.dates ?? []))
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
          buyerEmail: String(form.get("email") ?? user.email),
          phone: String(form.get("phone") ?? ""),
          date: String(form.get("date") ?? ""),
          time: String(form.get("time") ?? ""),
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

      setSuccess(true);
      onSuccess(data.booking.id);
    } catch {
      setError("تعذر حجز المعاينة.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const user = typeof window !== "undefined" ? getSessionUser() : null;

  return (
    <Modal
      description={`حجز معاينة: ${listing.title}`}
      onClose={onClose}
      open={open}
      title="احجز معاينة"
    >
      {success ? (
        <FormMessage variant="success">
          تم تأكيد حجز المعاينة. ستصلك تفاصيل الموعد في الإشعارات.
        </FormMessage>
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
            label="البريد الإلكتروني"
            name="email"
            required
            type="email"
          />
          <Input label="رقم الهاتف" name="phone" required type="tel" />
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
            options={(selectedDate ? slots : []).map((slot) => ({
              label: slot,
              value: slot,
            }))}
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
