import Link from "next/link";
import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/components/register-form";
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
  title: "Create account",
  description: "Register for Eager Pilots with email OTP.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_50%)] opacity-[0.07]" />
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Start your aviation education journey with Eager Pilots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href={routes.login} className="ml-1 font-medium text-primary hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
