import type { Metadata } from "next";

import { EmailAutomationView } from "@/features/email/components/email-automation-view";

export const metadata: Metadata = { title: "Email automation" };

export default function AdminEmailAutomationPage() {
  return <EmailAutomationView breadcrumbs={[{ label: "Admin" }, { label: "Email automation" }]} />;
}
