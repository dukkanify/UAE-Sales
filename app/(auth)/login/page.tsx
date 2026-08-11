import Link from "next/link";
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
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Eager Pilots with email OTP.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_50%)] opacity-[0.07]" />
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email to receive a one-time verification code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href={routes.register} className="ml-1 font-medium text-primary hover:underline">
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
