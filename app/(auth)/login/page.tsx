import Link from "@/components/ui/app-link";
import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { routes } from "@/constants/routes";
import { BrandLogo } from "@/components/brand/brand-logo";
import { siteConfig } from "@/config/site";
import { brandingConfig } from "@/config/branding";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${siteConfig.name} with a one-time email code.`,
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="hero-aviation absolute inset-0" />
      <div className="absolute inset-0 bg-[var(--surface-ink)]/55 backdrop-blur-[2px]" />
      <Card className="relative z-10 w-full max-w-md border-border/60 shadow-medium">
        <CardHeader className="space-y-5 text-center">
          <div className="flex justify-center">
            <BrandLogo href={routes.home} priority />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
              {brandingConfig.tagline}
            </p>
            <CardTitle className="font-display text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email to receive a one-time code for secure access.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingState label="Loading sign-in..." />}>
            <LoginForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-center gap-x-1 gap-y-1 text-center text-sm text-muted-foreground">
          New to ATPL PASS?{" "}
          <Link href={routes.register} className="font-medium text-primary hover:underline">
            Create a student or instructor account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
