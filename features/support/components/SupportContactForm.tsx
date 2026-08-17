"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { BRAND } from "@/shared/constants/brand";

export function SupportContactForm() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          topic: String(form.get("topic") ?? "other"),
          message: String(form.get("message") ?? ""),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "تعذر إرسال الرسالة. حاول مرة أخرى.");
        return;
      }
      setEmailed(data.emailed === true);
      setSent(true);
    } catch {
      setError("تعذر إرسال الرسالة. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <FormMessage variant="success">
        {emailed
          ? `استلمنا رسالتك وأرسلنا تأكيدًا إلى بريدك. يمكنك أيضًا مراسلتنا على ${BRAND.supportEmail}.`
          : `استلمنا رسالتك. إذا احتجت تواصلًا أسرع راسلنا على ${BRAND.supportEmail}.`}
      </FormMessage>
    );
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
      <Input label="الاسم" name="name" required />
      <Input dir="ltr" label="البريد الإلكتروني" name="email" required type="email" />
      <Select
        label="الموضوع"
        name="topic"
        options={[
          { label: "طلب أو دفع", value: "order" },
          { label: "إعلان", value: "listing" },
          { label: "ضمان مالي", value: "escrow" },
          { label: "الحساب", value: "account" },
          { label: "أخرى", value: "other" },
        ]}
        required
      />
      <Textarea label="الرسالة" name="message" required rows={5} />
      <Button loading={isSubmitting} type="submit" variant="accent">
        إرسال الرسالة
      </Button>
    </form>
  );
}
