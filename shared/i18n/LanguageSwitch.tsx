"use client";

import { setLocale, type AppLocale } from "./locale";
import { useLocale, useLocaleMessages } from "./useLocale";

type LanguageSwitchProps = {
  className?: string;
  variant?: "row" | "compact";
};

function Pill({
  active,
  label,
  locale,
}: {
  active: boolean;
  label: string;
  locale: AppLocale;
}) {
  return (
    <button
      aria-pressed={active}
      className={`language-switch__pill${active ? " is-active" : ""}`}
      onClick={() => setLocale(locale)}
      type="button"
    >
      {label}
    </button>
  );
}

export function LanguageSwitch({
  className = "",
  variant = "row",
}: LanguageSwitchProps) {
  const locale = useLocale();
  const copy = useLocaleMessages();
  const compact = variant === "compact";

  return (
    <div
      className={`language-switch${compact ? " language-switch--compact" : ""} ${className}`.trim()}
    >
      {compact ? null : (
        <span className="language-switch__label">{copy.language}</span>
      )}
      <div className="language-switch__pills" role="group" aria-label={copy.language}>
        <Pill active={locale === "ar"} label={copy.arabic} locale="ar" />
        <Pill active={locale === "en"} label={copy.english} locale="en" />
      </div>
    </div>
  );
}
