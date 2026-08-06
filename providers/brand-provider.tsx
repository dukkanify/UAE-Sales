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
  platformName: siteConfig?.name ?? "ATPL PASS",
  logoUrl: siteConfig?.brand?.logo ?? "/brand/logo.svg",
  darkLogoUrl: siteConfig?.brand?.logoDark ?? "/brand/logo-dark.svg",
  faviconUrl: siteConfig?.brand?.favicon ?? "/brand/favicon.svg",
  openGraphImageUrl: siteConfig?.brand?.openGraph ?? "/brand/og.svg",
  contactEmail: siteConfig?.contactEmail ?? "ME@ABDULAZIZALSHOAIL.COM",
  supportEmail: siteConfig?.supportEmail ?? "ME@ABDULAZIZALSHOAIL.COM",
  locations: [...(siteConfig?.locations ?? ["Kuwait", "Dubai"])],
  socialHandle: siteConfig?.socialHandle ?? "@ABDULAZIZ_ALSHOAIL",
  socialLinks: {
    instagram: siteConfig?.social?.instagram ?? "",
    twitter: siteConfig?.social?.twitter ?? "",
    linkedin: siteConfig?.social?.linkedin ?? "",
    youtube: siteConfig?.social?.youtube ?? "",
  },
  footerText: siteConfig?.description ?? "ATPL PASS aviation course platform",
  primaryColor: "#2E7DAA",
  accentColor: "#DD9B30",
  metaDescription: siteConfig?.description ?? "ATPL PASS aviation course platform",
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
          const next = { ...FALLBACK, ...json.data };
          // Never allow empty asset URLs to wipe fallbacks (HMR / partial API payloads).
          setBrand({
            ...next,
            platformName: next.platformName || FALLBACK.platformName,
            logoUrl: next.logoUrl || FALLBACK.logoUrl,
            darkLogoUrl: next.darkLogoUrl || FALLBACK.darkLogoUrl,
            faviconUrl: next.faviconUrl || FALLBACK.faviconUrl,
            openGraphImageUrl: next.openGraphImageUrl || FALLBACK.openGraphImageUrl,
          });
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
