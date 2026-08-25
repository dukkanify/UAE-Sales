import Link from "@/components/ui/app-link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { brandingConfig } from "@/config/branding";
import { routes } from "@/constants/routes";
import { BrandLogo } from "@/components/brand/brand-logo";

export const metadata: Metadata = {
  title: "Welcome",
  description: siteConfig.description,
};

export default function SplashPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="hero-aviation absolute inset-0" />
      <div className="absolute inset-0 bg-[var(--surface-ink)]/45" />
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <BrandLogo variant="dark" href={null} priority className="mb-6" />
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
          {brandingConfig.tagline}
        </p>
        <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
          <span className="text-primary-foreground/90">ATPL</span>{" "}
          <span className="text-accent">PASS</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/70">{siteConfig.description}</p>
        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="accent" size="lg" asChild>
            <Link href={routes.login}>Sign in</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            asChild
          >
            <Link href={routes.book}>Book live Zoom</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
