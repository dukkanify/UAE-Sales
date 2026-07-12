/** Normalize UAE phone to digits with optional leading +971. */
export function normalizeUaePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("971") && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("05") && digits.length === 10) {
    return `+971${digits.slice(1)}`;
  }
  if (digits.startsWith("5") && digits.length === 9) {
    return `+971${digits}`;
  }
  if (digits.length >= 8) {
    return digits;
  }
  return value.trim();
}

export function isValidUaePhone(value: string): boolean {
  const normalized = normalizeUaePhone(value);
  return /^(\+9715\d{8}|05\d{8}|5\d{8}|\d{8,})$/.test(normalized);
}
