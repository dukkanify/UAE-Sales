import { Suspense } from "react";
import type { Metadata } from "next";

import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";

export const metadata: Metadata = {
  title: "Verify code",
  description: "Enter your one-time email verification code.",
};

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_50%)] opacity-[0.07]" />
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to your inbox.
          </CardDescription>
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
