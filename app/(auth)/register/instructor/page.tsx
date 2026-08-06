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
import { BrandLogo } from "@/components/brand/brand-logo";
import { siteConfig } from "@/config/site";
import { brandingConfig } from "@/config/branding";

export const metadata: Metadata = {
  title: "Instructor registration",
  description: `Register as an ATPL PASS instructor — teach courses and run live Zoom coaching on ${siteConfig.name}.`,
  alternates: { canonical: routes.registerInstructor },
};

export default function InstructorRegisterPage() {
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
            <CardTitle className="font-display text-2xl">Teach on ATPL PASS</CardTitle>
            <CardDescription>
              Create your instructor account to manage assigned courses, students, and live Zoom
              sessions.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <RegisterForm role="instructor" />
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <p>
            Already registered?{" "}
            <Link href={routes.login} className="font-medium text-primary hover:underline">
              Enter
            </Link>
          </p>
          <p>
            Looking for learner access?{" "}
            <Link href={routes.register} className="font-medium text-primary hover:underline">
              Join as student
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
