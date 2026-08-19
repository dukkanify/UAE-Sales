import {
  LEGACY_STORAGE_KEYS,
  STORAGE_EVENTS,
  STORAGE_KEYS,
} from "@/shared/constants/brand";

export type AppLocale = "ar" | "en";

export const LOCALE_COOKIE = "sooqna-locale";

function isLocale(value: string | null | undefined): value is AppLocale {
  return value === "ar" || value === "en";
}

function migrateLocaleKey() {
  if (typeof window === "undefined") return;
  const current = window.localStorage.getItem(STORAGE_KEYS.locale);
  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEYS.locale);
  if (!current && legacy) {
    window.localStorage.setItem(STORAGE_KEYS.locale, legacy);
  }
  if (legacy) window.localStorage.removeItem(LEGACY_STORAGE_KEYS.locale);
}

export function getStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "ar";
  migrateLocaleKey();
  const stored = window.localStorage.getItem(STORAGE_KEYS.locale);
  if (isLocale(stored)) return stored;
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : "ar";
}

export function applyLocale(locale: AppLocale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
}

export function setLocale(locale: AppLocale) {
  applyLocale(locale);
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.locale, locale);
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event(STORAGE_EVENTS.localeChange));
}

/** Inline boot script — keeps first paint aligned with stored locale. */
export const LOCALE_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(STORAGE_KEYS.locale)};var t=localStorage.getItem(k);if(t!=="en"&&t!=="ar"){var l=localStorage.getItem(${JSON.stringify(LEGACY_STORAGE_KEYS.locale)});if(l==="en"||l==="ar"){t=l;localStorage.setItem(k,l)}else{var m=document.cookie.match(/(?:^|; )${LOCALE_COOKIE}=(en|ar)/);t=m?m[1]:"ar"}}localStorage.removeItem(${JSON.stringify(LEGACY_STORAGE_KEYS.locale)});document.documentElement.setAttribute("lang",t);document.documentElement.setAttribute("dir",t==="en"?"ltr":"rtl");}catch(e){}})();`;
