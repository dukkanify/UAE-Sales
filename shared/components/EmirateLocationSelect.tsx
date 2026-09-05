"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

type LocationOption = { id: string; name: string };

const EMIRATE_STORAGE_KEY = "sooqna_emirate";
const ALL_EMIRATES_NAME = "كل الإمارات";
const DEFAULT_EMIRATE = "أبوظبي";

function buildEmirateOptions(): LocationOption[] {
  const abuDhabi = cities.find((city) => city.id === "abu-dhabi");
  const rest = cities.filter((city) => city.id !== "abu-dhabi");
  const ordered = abuDhabi ? [abuDhabi, ...rest] : cities;

  return [
    { id: "all", name: ALL_EMIRATES_NAME },
    ...ordered.map((city) => ({ id: city.id, name: city.name })),
  ];
}

function readStoredEmirate(): string {
  if (typeof window === "undefined") return DEFAULT_EMIRATE;
  try {
    const stored = localStorage.getItem(EMIRATE_STORAGE_KEY);
    if (stored) return stored;
  } catch {
    /* ignore storage errors */
  }
  return DEFAULT_EMIRATE;
}

type EmirateLocationSelectProps = {
  className?: string;
  defaultCity?: string;
  onCityChange?: (city: string) => void;
  variant?: "mobile" | "desktop";
};

export function EmirateLocationSelect({
  className = "",
  defaultCity = DEFAULT_EMIRATE,
  onCityChange,
  variant = "mobile",
}: EmirateLocationSelectProps) {
  const router = useRouter();
  const options = useMemo(() => buildEmirateOptions(), []);
  const [city, setCity] = useState(defaultCity);

  useEffect(() => {
    setCity(readStoredEmirate());
  }, []);

  function handleChange(next: string) {
    setCity(next);
    onCityChange?.(next);
    try {
      localStorage.setItem(EMIRATE_STORAGE_KEY, next);
    } catch {
      /* ignore storage errors */
    }
    router.push(
      next === ALL_EMIRATES_NAME ? "/search" : `/search?city=${encodeURIComponent(next)}`,
    );
  }

  if (variant === "desktop") {
    return (
      <label
        className={`relative inline-flex min-h-10 max-w-[11rem] items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5 ${className}`.trim()}
      >
        <Icon className="shrink-0 text-[#B8955F]" name="map" size={14} />
        <span className="min-w-0 truncate text-xs font-bold text-ink">{city}</span>
        <select
          aria-label="الإمارة"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(event) => handleChange(event.target.value)}
          value={city}
        >
          {options.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
        <Icon className="shrink-0 text-muted" name="chevron-left" size={11} />
      </label>
    );
  }

  return (
    <label className={`mobile-home-header__location ${className}`.trim()}>
      <Icon className="mobile-home-header__location-icon" name="map" size={14} />
      <span className="mobile-home-header__location-value">{city}</span>
      <select
        aria-label="الإمارة"
        className="mobile-home-header__location-select"
        onChange={(event) => handleChange(event.target.value)}
        value={city}
      >
        {options.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
      <Icon className="mobile-home-header__chevron" name="chevron-left" size={11} />
    </label>
  );
}
