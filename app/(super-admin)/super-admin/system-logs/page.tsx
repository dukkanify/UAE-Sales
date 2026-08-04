import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "System logs" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="System logs"
      description="Infrastructure and security event streams."
      role="super-admin"
      href="/super-admin/system-logs"
      icon="ScrollText"
      emptyTitle="System logs module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
