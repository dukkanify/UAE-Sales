"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { useT } from "@/shared/i18n/useLocale";
import { Icon } from "@/shared/ui/Icon";
import {
  getResolvedTheme,
  toggleTheme,
  type ThemeMode,
} from "@/shared/theme/theme";

type ThemeToggleProps = {
  className?: string;
};

function subscribe(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENTS.themeChange, onStoreChange);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onStoreChange);
  return () => {
    window.removeEventListener(STORAGE_EVENTS.themeChange, onStoreChange);
    media.removeEventListener("change", onStoreChange);
  };
}

function getSnapshot(): ThemeMode {
  return getResolvedTheme();
}

function getServerSnapshot(): ThemeMode {
  return "light";
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = useT();
  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? t("theme.toLight") : t("theme.toDark")}
      className={`theme-toggle motion-press focus-ring grid size-10 shrink-0 place-items-center rounded-[var(--radius-xl)] border border-border bg-surface text-ink shadow-[var(--shadow-xs)] transition hover:border-secondary/50 ${className}`}
      onClick={() => {
        toggleTheme();
      }}
      type="button"
    >
      <Icon
        className={`theme-toggle__icon ${isDark ? "theme-toggle__icon--sun" : "theme-toggle__icon--moon"}`}
        name={isDark ? "sun" : "moon"}
        size={18}
      />
    </button>
  );
}
