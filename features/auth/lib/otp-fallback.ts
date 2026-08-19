const STORAGE_KEY = "sooqna-otp-fallback";
const CHANGE_EVENT = "sooqna-otp-fallback-change";

function notifyOtpFallback() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** OTP must never be stored in the browser. */
export function saveOtpFallback(email: string, otp: string) {
  void email;
  void otp;
}

export function readOtpFallback(email: string): string | null {
  void email;
  return null;
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
