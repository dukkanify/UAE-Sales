"use client";

import { LOCALES, setLocale } from "@/shared/i18n/locale";
import { useLocale, useT } from "@/shared/i18n/useLocale";
import { Icon } from "@/shared/ui/Icon";

type LanguageSelectProps = {
  className?: string;
  variant?: "header" | "drawer";
};

export function LanguageSelect({
  className = "",
  variant = "header",
}: LanguageSelectProps) {
  const locale = useLocale();
  const t = useT();

  return (
    <div
      aria-label={t("label.language")}
      className={`language-select language-select--${variant} ${className}`.trim()}
      role="group"
    >
      {variant === "drawer" ? (
        <span className="language-select__label">
          <Icon name="globe" size={15} />
          {t("label.language")}
        </span>
      ) : (
        <Icon className="language-select__globe" name="globe" size={14} />
      )}
      <div className="language-select__track">
        {LOCALES.map((item) => {
          const active = item.id === locale;
          return (
            <button
              aria-pressed={active}
              className={`language-select__btn${active ? " is-active" : ""}`}
              key={item.id}
              onClick={() => setLocale(item.id)}
              type="button"
            >
              <span className="language-select__short">{item.short}</span>
              <span className="language-select__full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
