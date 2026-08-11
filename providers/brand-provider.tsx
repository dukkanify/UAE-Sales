"use client";

import * as React from "react";

import { siteStatic } from "@/config/site-static";

export type RuntimeBrand = {
  platformName: string;
  logoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  openGraphImageUrl: string;
  contactEmail: string;
  supportEmail: string;
  locations: string[];
  socialHandle: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
  };
  footerText: string;
  primaryColor: string;
  accentColor: string;
  metaDescription: string;
};

const FALLBACK: RuntimeBrand = {
  platformName: siteStatic.name,
  logoUrl: siteStatic.brand.logo,
  darkLogoUrl: siteStatic.brand.logoDark,
  faviconUrl: siteStatic.brand.favicon,
  openGraphImageUrl: siteStatic.brand.openGraph,
  contactEmail: siteStatic.contactEmail,
  supportEmail: siteStatic.supportEmail,
  locations: [...siteStatic.locations],
  socialHandle: siteStatic.socialHandle,
  socialLinks: { ...siteStatic.social },
  footerText: siteStatic.description,
  primaryColor: "#2E7DAA",
  accentColor: "#DD9B30",
  metaDescription: siteStatic.description,
};

const BrandContext = React.createContext<RuntimeBrand>(FALLBACK);

function applyBrandCssVars(brand: RuntimeBrand) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--horizon-blue", brand.primaryColor);
  root.style.setProperty("--sun-gold", brand.accentColor);
  root.style.setProperty("--primary", brand.primaryColor);
  root.style.setProperty("--accent", brand.accentColor);
  root.style.setProperty("--ring", brand.primaryColor);
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = React.useState<RuntimeBrand>(FALLBACK);

  React.useEffect(() => {
    applyBrandCssVars(FALLBACK);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    const load = () => {
      void fetch("/api/public/brand")
        .then((r) => r.json())
        .then((json: { success?: boolean; data?: Partial<RuntimeBrand> }) => {
          if (cancelled || !json.success || !json.data) return;
          const next = { ...FALLBACK, ...json.data };
          const resolved: RuntimeBrand = {
            ...next,
            platformName: next.platformName || FALLBACK.platformName,
            logoUrl: next.logoUrl || FALLBACK.logoUrl,
            darkLogoUrl: next.darkLogoUrl || FALLBACK.darkLogoUrl,
            faviconUrl: next.faviconUrl || FALLBACK.faviconUrl,
            openGraphImageUrl: next.openGraphImageUrl || FALLBACK.openGraphImageUrl,
            primaryColor: next.primaryColor || FALLBACK.primaryColor,
            accentColor: next.accentColor || FALLBACK.accentColor,
          };
          setBrand(resolved);
          applyBrandCssVars(resolved);
        })
        .catch(() => {
          /* keep fallback */
        });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(load, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(load, 200);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): RuntimeBrand {
  return React.useContext(BrandContext);
}
