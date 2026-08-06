import type { Metadata } from "next";

import { RegisterShell } from "@/features/auth/components/register-shell";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Instructor registration",
  description: `Register as an AviatorPass instructor — teach courses and run live Zoom coaching on ${siteConfig.name}.`,
  alternates: { canonical: routes.registerInstructor },
};

export default function InstructorRegisterPage() {
  return <RegisterShell initialRole="instructor" />;
}
