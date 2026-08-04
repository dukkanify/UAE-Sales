import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Courses" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Courses"
      description="Operational course oversight for administrators."
      role="admin"
      href="/admin/courses"
      icon="BookOpen"
      emptyTitle="Courses module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
