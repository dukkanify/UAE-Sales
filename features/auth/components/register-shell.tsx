"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";

import { BrandLogo } from "@/components/brand/brand-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { brandingConfig } from "@/config/branding";
import { routes } from "@/constants/routes";
import {
  RegisterForm,
  ROLE_COPY,
  type RegisterRole,
} from "@/features/auth/components/register-form";

function RegisterShell({ initialRole = "student" }: { initialRole?: RegisterRole }) {
  const [role, setRole] = React.useState<RegisterRole>(initialRole);
  const copy = ROLE_COPY[role];

  const handleRoleChange = (next: RegisterRole) => {
    setRole(next);
    // Sync deep-link URL without remounting (keeps typed form fields).
    const href = next === "instructor" ? routes.registerInstructor : routes.register;
    if (typeof window !== "undefined" && window.location.pathname !== href) {
      window.history.replaceState(null, "", href);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:py-16">
      <div className="hero-aviation absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(3,8,12,0.72)_0%,rgba(11,26,36,0.58)_48%,rgba(18,48,68,0.62)_100%)] backdrop-blur-[1.5px]" />
      <div
        className="pointer-events-none absolute inset-x-[12%] top-[18%] h-px bg-gradient-to-r from-transparent via-[rgb(221_155_48_/0.45)] to-transparent"
        aria-hidden
      />

      <Card className="relative z-10 w-full max-w-[28rem] overflow-hidden border-border/50 bg-card/95 shadow-[0_28px_80px_-36px_rgba(3,8,12,0.65)] backdrop-blur-sm">
        <div
          className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary/40"
          aria-hidden
        />
        <CardHeader className="space-y-5 pb-2 text-center">
          <div className="flex justify-center pt-1">
            <BrandLogo href={routes.home} priority />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">
              {brandingConfig.tagline}
            </p>
            <CardTitle className="font-display text-[1.75rem] tracking-[-0.03em] text-foreground">
              {copy.headline}
            </CardTitle>
            <CardDescription className="mx-auto max-w-[34ch] text-[0.95rem] leading-relaxed">
              {copy.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <RegisterForm role={role} onRoleChange={handleRoleChange} />
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t border-border/50 bg-[rgb(18_36_51_/0.03)] py-5 text-center text-sm text-muted-foreground">
          <p>
            Already on the platform?{" "}
            <Link href={routes.login} className="font-medium text-primary hover:underline">
              Enter
            </Link>
          </p>
          <p className="text-xs text-muted-foreground/90">
            One form for students and instructors — pick your account type above.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export { RegisterShell };
