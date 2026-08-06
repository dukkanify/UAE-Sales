import type { Metadata } from "next";

import { RegisterShell } from "@/features/auth/components/register-shell";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Join platform",
  description: `Join ${siteConfig.name} as a student or instructor — ATPL courses, live Zoom coaching, and exam tools.`,
  alternates: { canonical: routes.register },
};

export default function RegisterPage() {
  return <RegisterShell initialRole="student" />;
}
