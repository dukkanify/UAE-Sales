import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Communities" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Communities"
      description="Community moderation tools arrive in a later module."
      role="super-admin"
      href="/super-admin/communities"
      icon="Users"
      emptyTitle="Communities module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
