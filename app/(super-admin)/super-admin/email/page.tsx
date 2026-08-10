import type { Metadata } from "next";

import { EmailAutomationView } from "@/features/email/components/email-automation-view";

export const metadata: Metadata = { title: "Email automation" };

export default function SuperAdminEmailAutomationPage() {
  return (
    <EmailAutomationView breadcrumbs={[{ label: "Super Admin" }, { label: "Email automation" }]} />
  );
}
