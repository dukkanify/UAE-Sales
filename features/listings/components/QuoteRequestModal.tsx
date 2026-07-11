"use client";

import type { Listing } from "@/types";
import type { QuoteRequestKind } from "@/types/domain/quote-request";
import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { cities } from "@/shared/constants/locations";
import { getSessionUser } from "@/services/storage";

type QuoteRequestModalProps = {
  kind?: QuoteRequestKind;
  listing: Listing;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
  open: boolean;
};

export function QuoteRequestModal({
  kind = "quote",
  listing,
  onClose,
  onSuccess,
  open,
}: QuoteRequestModalProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");

  const isBooking = kind === "service_booking";
  const title = isBooking ? "احجز الخدمة" : "طلب عرض سعر";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const user = getSessionUser();
    if (!user) return;

    const form = new FormData(event.currentTarget);
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
          requesterName: String(form.get("fullName") ?? user.fullName),
          requesterEmail: String(form.get("email") ?? user.email),
          phone: String(form.get("phone") ?? ""),
          serviceRequired: String(form.get("serviceRequired") ?? listing.title),
          description: String(form.get("description") ?? ""),
          emirate: String(form.get("emirate") ?? ""),
          area: String(form.get("area") ?? ""),
          preferredDate: String(form.get("preferredDate") ?? ""),
          preferredTime: String(form.get("preferredTime") ?? ""),
          budgetMin: form.get("budgetMin")
            ? Number(form.get("budgetMin"))
            : undefined,
          budgetMax: form.get("budgetMax")
            ? Number(form.get("budgetMax"))
            : undefined,
          attachmentName: attachmentName || undefined,
          providerId: listing.seller.id,
          providerName: listing.seller.name,
        }),
      });

      const data = await response.json();
      if (response.status === 409) {
        setError("لديك طلب مفتوح لهذا الإعلان.");
        return;
      }
      if (!response.ok) {
        setError("تعذر إرسال الطلب.");
        return;
      }

      setSuccess(true);
      onSuccess(data.quoteRequest.id);
    } catch {
      setError("تعذر إرسال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const user = typeof window !== "undefined" ? getSessionUser() : null;

  return (
    <Modal
      description={listing.title}
      onClose={onClose}
      open={open}
      title={title}
    >
      {success ? (
        <FormMessage variant="success">
          {isBooking
            ? "تم إرسال طلب حجز الخدمة. سيتواصل مزود الخدمة معك قريباً."
            : "تم إرسال طلب عرض السعر. سيتواصل مزود الخدمة معك قريباً."}
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
          <Input
            defaultValue={listing.title}
            label="الخدمة المطلوبة"
            name="serviceRequired"
            required
          />
          <Textarea
            label="وصف الطلب"
            name="description"
            placeholder="صف احتياجك بالتفصيل..."
            required
          />
          <Select
            label="الإمارة"
            name="emirate"
            options={cities.map((city) => ({ label: city.name, value: city.name }))}
            required
          />
          <Input label="المنطقة" name="area" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="التاريخ المفضل" name="preferredDate" required type="date" />
            <Input label="الوقت المفضل" name="preferredTime" required type="time" />
          </div>
          {!isBooking ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="الميزانية من" name="budgetMin" type="number" />
              <Input label="الميزانية إلى" name="budgetMax" type="number" />
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">
              مرفق (اختياري)
            </label>
            <input
              className="block w-full text-sm"
              onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? "")}
              type="file"
            />
          </div>
          <div className="flex gap-2">
            <Button loading={isSubmitting} type="submit" variant="accent">
              إرسال
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
