import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Platform settings" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Platform settings"
      description="Global configuration, branding, and feature flags."
      role="super-admin"
      href="/super-admin/settings"
      icon="Settings"
      emptyTitle="Platform settings module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
