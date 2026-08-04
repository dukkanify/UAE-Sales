import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "My courses" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="My courses"
      description="Your enrolled programs will appear here."
      role="student"
      href="/student/courses"
      icon="BookOpen"
      emptyTitle="My courses module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
