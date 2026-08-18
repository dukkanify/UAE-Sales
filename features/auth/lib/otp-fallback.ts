const STORAGE_KEY = "sooqna-otp-fallback";
const CHANGE_EVENT = "sooqna-otp-fallback-change";

type OtpFallback = {
  email: string;
  otp: string;
};

function notifyOtpFallback() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveOtpFallback(email: string, otp: string) {
  if (typeof window === "undefined") return;
  if (!/^\d{6}$/.test(otp)) return;
  const payload: OtpFallback = {
    email: email.trim().toLowerCase(),
    otp,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  notifyOtpFallback();
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
  notifyOtpFallback();
}

export function subscribeOtpFallback(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
