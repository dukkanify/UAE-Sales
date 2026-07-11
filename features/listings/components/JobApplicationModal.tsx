"use client";

import type { Listing } from "@/types";
import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { LISTING_ERRORS } from "@/shared/constants/listing-errors";
import { isOwnListing } from "@/shared/listings/listing-ownership";
import { getSessionUser } from "@/services/storage";

type JobApplicationModalProps = {
  listing: Listing;
  onClose: () => void;
  onSuccess: (applicationId: string) => void;
  open: boolean;
};

export function JobApplicationModal({
  listing,
  onClose,
  onSuccess,
  open,
}: JobApplicationModalProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFileName, setCvFileName] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const user = getSessionUser();
    if (!user) return;

    if (isOwnListing(listing, user)) {
      setError(LISTING_ERRORS.ownListing);
      return;
    }

    if (!cvFileName) {
      setError("يرجى إرفاق السيرة الذاتية.");
      return;
    }

    const lowerCv = cvFileName.toLowerCase();
    if (![".pdf", ".doc", ".docx"].some((ext) => lowerCv.endsWith(ext))) {
      setError("يرجى إرفاق ملف بصيغة PDF أو Word.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const years = Number(form.get("yearsOfExperience"));
    const coverMessage = String(form.get("coverMessage") ?? "").trim();

    if (coverMessage.length < 20) {
      setError("رسالة التقديم يجب أن تكون 20 حرفاً على الأقل.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          listingTitle: listing.title,
          listingSlug: listing.slug,
          applicantId: user.id,
          applicantName: String(form.get("fullName") ?? user.fullName),
          applicantEmail: String(form.get("email") ?? user.email),
          phone: String(form.get("phone") ?? ""),
          currentCity: String(form.get("currentCity") ?? ""),
          yearsOfExperience: years,
          availabilityDate: String(form.get("availabilityDate") ?? ""),
          coverMessage,
          cvFileName,
          employerId: listing.seller.id,
          employerName: listing.seller.name,
        }),
      });

      const data = await response.json();
      if (response.status === 409) {
        setError("لقد قدّمت على هذه الوظيفة مسبقاً.");
        return;
      }
      if (response.status === 403) {
        setError(LISTING_ERRORS.ownListing);
        return;
      }
      if (!response.ok) {
        setError("تعذر إرسال الطلب. تحقق من البيانات وحاول مرة أخرى.");
        return;
      }

      setSuccess(true);
      onSuccess(data.application.id);
    } catch {
      setError("تعذر إرسال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const user = typeof window !== "undefined" ? getSessionUser() : null;

  return (
    <Modal
      description={`التقديم على: ${listing.title}`}
      onClose={onClose}
      open={open}
      title="تقديم على الوظيفة"
    >
      {success ? (
        <FormMessage variant="success">
          تم إرسال طلب التوظيف بنجاح. سيتم إخطارك عند تحديث الحالة.
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
          <Input label="المدينة الحالية" name="currentCity" required />
          <Input
            label="سنوات الخبرة"
            max={50}
            min={0}
            name="yearsOfExperience"
            required
            type="number"
          />
          <Input label="تاريخ التوفر" name="availabilityDate" required type="date" />
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">
              السيرة الذاتية
            </label>
            <input
              accept=".pdf,.doc,.docx"
              className="block w-full text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setCvFileName(file?.name ?? "");
              }}
              required
              type="file"
            />
          </div>
          <Textarea
            label="رسالة التقديم"
            name="coverMessage"
            placeholder="اذكر خبرتك ولماذا أنت مناسب لهذه الوظيفة..."
            required
          />
          <div className="flex gap-2">
            <Button loading={isSubmitting} type="submit" variant="accent">
              إرسال الطلب
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
