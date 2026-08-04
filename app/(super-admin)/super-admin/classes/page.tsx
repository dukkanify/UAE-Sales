import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Classes" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Classes"
      description="Live class scheduling and attendance will connect here."
      role="super-admin"
      href="/super-admin/classes"
      icon="Video"
      emptyTitle="Classes module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
