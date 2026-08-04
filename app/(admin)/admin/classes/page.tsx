import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Classes" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Classes"
      description="Schedule and monitor live class operations."
      role="admin"
      href="/admin/classes"
      icon="Video"
      emptyTitle="Classes module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
