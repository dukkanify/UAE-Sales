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

export function saveOtpFallback(_email: string, _otp: string) {
  return;
}

export function readOtpFallback(_email: string): string | null {
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
