"use client";

import * as React from "react";

import { siteConfig } from "@/config/site";

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
  platformName: siteConfig.name,
  logoUrl: siteConfig.brand.logo,
  darkLogoUrl: siteConfig.brand.logoDark,
  faviconUrl: siteConfig.brand.favicon,
  openGraphImageUrl: siteConfig.brand.openGraph,
  contactEmail: siteConfig.contactEmail,
  supportEmail: siteConfig.supportEmail,
  locations: [...siteConfig.locations],
  socialHandle: siteConfig.socialHandle,
  socialLinks: { ...siteConfig.social },
  footerText: siteConfig.description,
  primaryColor: "#2E7DAA",
  accentColor: "#DD9B30",
  metaDescription: siteConfig.description,
};

const BrandContext = React.createContext<RuntimeBrand>(FALLBACK);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = React.useState<RuntimeBrand>(FALLBACK);

  React.useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    const load = () => {
      void fetch("/api/public/brand")
        .then((r) => r.json())
        .then((json: { success?: boolean; data?: Partial<RuntimeBrand> }) => {
          if (cancelled || !json.success || !json.data) return;
          setBrand({ ...FALLBACK, ...json.data });
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
