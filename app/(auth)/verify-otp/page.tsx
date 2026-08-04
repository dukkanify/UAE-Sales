import { Suspense } from "react";
import type { Metadata } from "next";

import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { BrandLogo } from "@/components/brand/brand-logo";
import { routes } from "@/constants/routes";
import { brandingConfig } from "@/config/branding";

export const metadata: Metadata = {
  title: "Verify code",
  description: "Enter your one-time email verification code.",
};

export default function VerifyOtpPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="hero-aviation absolute inset-0" />
      <div className="absolute inset-0 bg-[#0B1A24]/55 backdrop-blur-[2px]" />
      <Card className="relative z-10 w-full max-w-md border-border/60 shadow-medium">
        <CardHeader className="space-y-5 text-center">
          <div className="flex justify-center">
            <BrandLogo href={routes.home} priority />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
              {brandingConfig.tagline}
            </p>
            <CardTitle className="font-display text-2xl">Verify your email</CardTitle>
            <CardDescription>Enter the 6-digit code we sent to your inbox.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingState label="Loading verification form..." />}>
            <VerifyOtpForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
