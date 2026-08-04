import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Lessons" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Lessons"
      description="Build and organize lessons for your cohorts."
      role="instructor"
      href="/instructor/lessons"
      icon="BookOpen"
      emptyTitle="Lessons module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
