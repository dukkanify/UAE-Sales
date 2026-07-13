"use client";

import { useState } from "react";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

type EmirateLocationSelectProps = {
  className?: string;
  defaultCity?: string;
  onCityChange?: (city: string) => void;
  variant?: "mobile" | "desktop";
};

export function EmirateLocationSelect({
  className = "",
  defaultCity = "دبي",
  onCityChange,
  variant = "mobile",
}: EmirateLocationSelectProps) {
  const [city, setCity] = useState(defaultCity);

  function handleChange(nextCity: string) {
    setCity(nextCity);
    onCityChange?.(nextCity);
  }

  if (variant === "desktop") {
    return (
      <label
        className={`relative inline-flex min-h-10 max-w-[11rem] items-center gap-2 rounded-full border border-border bg-[#fdfbf7] px-3 py-1.5 ${className}`.trim()}
      >
        <Icon className="shrink-0 text-[#B8955F]" name="map" size={14} />
        <span className="min-w-0 truncate text-xs font-bold text-ink">{city}</span>
        <select
          aria-label="الإمارة"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(event) => handleChange(event.target.value)}
          value={city}
        >
          {cities.map((item) => (
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
        {cities.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
      <Icon className="mobile-home-header__chevron" name="chevron-left" size={11} />
    </label>
  );
}
