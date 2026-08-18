const STORAGE_KEY = "sooqna-otp-fallback";

type OtpFallback = {
  email: string;
  otp: string;
};

export function saveOtpFallback(email: string, otp: string) {
  if (typeof window === "undefined") return;
  const payload: OtpFallback = {
    email: email.trim().toLowerCase(),
    otp,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readOtpFallback(email: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OtpFallback;
    if (parsed.email !== email.trim().toLowerCase()) return null;
    if (!/^\d{6}$/.test(parsed.otp)) return null;
    return parsed.otp;
  } catch {
    return null;
  }
}

export function clearOtpFallback() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
