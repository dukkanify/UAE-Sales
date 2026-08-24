/**
 * Sanitize user-provided strings for safe display / storage.
 */

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().normalize("NFC").slice(0, 254);
}

/** Normalize phone to digits with optional leading +. */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim().normalize("NFC");
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}
