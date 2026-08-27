"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { BRAND } from "@/shared/constants/brand";

type FieldErrors = Partial<Record<"name" | "email" | "topic" | "message", string>>;

export function SupportContactForm() {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("other");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.fieldErrors && typeof data.fieldErrors === "object") {
          setFieldErrors(data.fieldErrors as FieldErrors);
        }
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
      <Input
        error={fieldErrors.name}
        label="الاسم"
        name="name"
        onChange={(event) => setName(event.target.value)}
        required
        value={name}
      />
      <Input
        dir="ltr"
        error={fieldErrors.email}
        label="البريد الإلكتروني"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        required
        type="email"
        value={email}
      />
      <Select
        error={fieldErrors.topic}
        label="الموضوع"
        name="topic"
        onChange={(event) => setTopic(event.target.value)}
        options={[
          { label: "طلب أو دفع", value: "order" },
          { label: "إعلان", value: "listing" },
          { label: "ضمان مالي", value: "escrow" },
          { label: "الحساب", value: "account" },
          { label: "أخرى", value: "other" },
        ]}
        required
        value={topic}
      />
      <Textarea
        error={fieldErrors.message}
        label="الرسالة"
        name="message"
        onChange={(event) => setMessage(event.target.value)}
        required
        rows={5}
        value={message}
      />
      <Button loading={isSubmitting} type="submit" variant="accent">
        إرسال الرسالة
      </Button>
    </form>
  );
}
