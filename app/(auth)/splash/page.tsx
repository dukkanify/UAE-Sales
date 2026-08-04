import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { BrandLogo } from "@/components/brand/brand-logo";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function SplashPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-primary px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.35),_transparent_55%)]" />
      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <BrandLogo variant="dark" href={null} priority className="mb-6" />
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">
          {siteConfig.name}
        </h1>
        <p className="mt-3 text-sm text-white/70">{siteConfig.description}</p>
        <p className="mt-4 text-sm text-white/60">
          {siteConfig.locations.join(" · ")} · {siteConfig.socialHandle}
        </p>
        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="accent" size="lg" asChild>
            <Link href={routes.login}>Sign in</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            asChild
          >
            <Link href={routes.register}>Create account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
