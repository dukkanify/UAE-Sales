import { STORAGE_EVENTS, STORAGE_KEYS } from "@/shared/constants/brand";

export type Locale = "ar" | "en";

export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "sooqna_locale";

export const LOCALES = [
  { dir: "rtl", htmlLang: "ar", id: "ar" as const, label: "العربية", short: "AR" },
  { dir: "ltr", htmlLang: "en", id: "en" as const, label: "English", short: "EN" },
] as const;

export function parseLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "ar";
}

export function getLocaleMeta(locale: Locale) {
  return LOCALES.find((item) => item.id === locale) ?? LOCALES[0];
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  return parseLocale(window.localStorage.getItem(STORAGE_KEYS.locale));
}

export function applyLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  const meta = getLocaleMeta(locale);
  document.documentElement.setAttribute("dir", meta.dir);
  document.documentElement.setAttribute("lang", meta.htmlLang);
  document.documentElement.setAttribute("data-locale", locale);
}

export function setLocale(locale: Locale) {
  applyLocale(locale);
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.locale, locale);
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event(STORAGE_EVENTS.localeChange));
}

export function subscribeLocale(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENTS.localeChange, onStoreChange);
  return () => window.removeEventListener(STORAGE_EVENTS.localeChange, onStoreChange);
}

/** Inline boot script — keeps first paint aligned with stored language. */
export const LOCALE_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(STORAGE_KEYS.locale)};var t=localStorage.getItem(k);if(t!=="en"&&t!=="ar"){var m=document.cookie.match(/(?:^|; )${LOCALE_COOKIE}=([^;]+)/);t=m?decodeURIComponent(m[1]):"ar";}if(t!=="en"&&t!=="ar")t="ar";document.documentElement.setAttribute("dir",t==="en"?"ltr":"rtl");document.documentElement.setAttribute("lang",t==="en"?"en":"ar");document.documentElement.setAttribute("data-locale",t);}catch(e){}})();`;
