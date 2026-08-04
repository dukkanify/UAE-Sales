import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Communities" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Communities"
      description="Moderate community spaces and reports."
      role="admin"
      href="/admin/communities"
      icon="Users"
      emptyTitle="Communities module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
