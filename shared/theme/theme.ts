import {
  LEGACY_STORAGE_KEYS,
  STORAGE_EVENTS,
  STORAGE_KEYS,
} from "@/shared/constants/brand";

export type ThemeMode = "light" | "dark";

function migrateThemeKey() {
  if (typeof window === "undefined") return;
  const current = window.localStorage.getItem(STORAGE_KEYS.theme);
  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEYS.theme);
  if (!current && legacy) {
    window.localStorage.setItem(STORAGE_KEYS.theme, legacy);
  }
  if (legacy) window.localStorage.removeItem(LEGACY_STORAGE_KEYS.theme);
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  migrateThemeKey();
  const raw = window.localStorage.getItem(STORAGE_KEYS.theme);
  if (raw === "dark" || raw === "light") return raw;
  return null;
}

export function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getResolvedTheme(): ThemeMode {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function setTheme(theme: ThemeMode) {
  applyTheme(theme);
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  window.dispatchEvent(new Event(STORAGE_EVENTS.themeChange));
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getResolvedTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

/** Inline boot script — keeps first paint aligned with stored/system theme. */
export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(STORAGE_KEYS.theme)};var t=localStorage.getItem(k);if(t!=="dark"&&t!=="light"){var l=localStorage.getItem(${JSON.stringify(LEGACY_STORAGE_KEYS.theme)});if(l==="dark"||l==="light"){t=l;localStorage.setItem(k,l)}else{t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}}localStorage.removeItem(${JSON.stringify(LEGACY_STORAGE_KEYS.theme)});document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
