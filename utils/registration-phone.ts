/**
 * Kuwait & UAE mobile validation for registration.
 */

export type RegistrationDialCountry = "KW" | "AE";

export const REGISTRATION_PHONE_COUNTRIES = [
  { code: "KW" as const, dialCode: "+965", flag: "🇰🇼", label: "Kuwait" },
  { code: "AE" as const, dialCode: "+971", flag: "🇦🇪", label: "UAE" },
] as const;

const KW_LOCAL_LENGTH = 8;
const AE_LOCAL_LENGTH = 9;

/** Kuwait mobile: 8 digits starting with 5, 6, or 9. */
export const KUWAIT_MOBILE_PATTERN = /^[569]\d{7}$/;

/** UAE mobile: 9 digits starting with 5. */
export const UAE_MOBILE_PATTERN = /^5\d{8}$/;

export function dialCountryFromRegistrationCountry(
  countryCode: string,
): RegistrationDialCountry | null {
  if (countryCode === "KW") return "KW";
  if (countryCode === "AE") return "AE";
  return null;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Extract local mobile digits from pasted/full phone value for a dial country. */
export function parseLocalDigitsFromInput(
  dialCountry: RegistrationDialCountry,
  raw: string,
): string {
  const dial = REGISTRATION_PHONE_COUNTRIES.find((c) => c.code === dialCountry)!;
  let digits = digitsOnly(raw);
  const dialDigits = dial.dialCode.replace("+", "");
  if (digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  }
  const max = dialCountry === "KW" ? KW_LOCAL_LENGTH : AE_LOCAL_LENGTH;
  return digits.slice(0, max);
}

export function buildRegistrationPhone(
  dialCountry: RegistrationDialCountry,
  localDigits: string,
): string {
  const dial = REGISTRATION_PHONE_COUNTRIES.find((c) => c.code === dialCountry)!;
  return `${dial.dialCode}${localDigits}`;
}

export function formatLocalPhoneDisplay(
  dialCountry: RegistrationDialCountry,
  localDigits: string,
): string {
  if (!localDigits) return "";
  if (dialCountry === "KW") {
    if (localDigits.length <= 4) return localDigits;
    return `${localDigits.slice(0, 4)} ${localDigits.slice(4)}`;
  }
  if (localDigits.length <= 2) return localDigits;
  if (localDigits.length <= 5) return `${localDigits.slice(0, 2)} ${localDigits.slice(2)}`;
  return `${localDigits.slice(0, 2)} ${localDigits.slice(2, 5)} ${localDigits.slice(5)}`;
}

export function validateLocalMobile(
  dialCountry: RegistrationDialCountry,
  localDigits: string,
): string | null {
  const dial = REGISTRATION_PHONE_COUNTRIES.find((c) => c.code === dialCountry)!;
  const expected = dialCountry === "KW" ? KW_LOCAL_LENGTH : AE_LOCAL_LENGTH;

  if (!localDigits) {
    return "Enter your mobile number";
  }
  if (localDigits.length < expected) {
    return dialCountry === "KW"
      ? "Kuwait mobile numbers are 8 digits (starting with 5, 6, or 9)"
      : "UAE mobile numbers are 9 digits (starting with 5)";
  }
  if (dialCountry === "KW" && !KUWAIT_MOBILE_PATTERN.test(localDigits)) {
    return "Enter a valid Kuwait mobile number (starts with 5, 6, or 9)";
  }
  if (dialCountry === "AE" && !UAE_MOBILE_PATTERN.test(localDigits)) {
    return "Enter a valid UAE mobile number (starts with 5)";
  }
  if (!localDigits.match(/^\d+$/)) {
    return `Enter a valid ${dial.label} mobile number`;
  }
  return null;
}

export function validateRegistrationPhoneE164(phone: string): string | null {
  const normalized = phone.replace(/[\s()-]/g, "");
  if (normalized.startsWith("+965")) {
    const local = normalized.slice(4);
    return validateLocalMobile("KW", local);
  }
  if (normalized.startsWith("+971")) {
    const local = normalized.slice(4);
    return validateLocalMobile("AE", local);
  }
  return "Use a Kuwait (+965) or UAE (+971) mobile number";
}

export function localPlaceholder(dialCountry: RegistrationDialCountry): string {
  return dialCountry === "KW" ? "5XXX XXXX" : "5X XXX XXXX";
}
