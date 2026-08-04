import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "My courses" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="My courses"
      description="Your assigned courses will appear here once curriculum modules ship."
      role="instructor"
      href="/instructor/courses"
      icon="BookOpen"
      emptyTitle="My courses module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
