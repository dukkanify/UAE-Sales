import Link from "next/link";
import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";
import { BrandLogo } from "@/components/brand/brand-logo";
import { brandingConfig } from "@/config/branding";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
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
            <CardTitle className="font-display text-2xl">Forgot password</CardTitle>
            <CardDescription>
              Enter your email and we will send a one-time reset code.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <Link href={routes.login} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
