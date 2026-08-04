import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Students" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Students"
      description="Track learners enrolled in your courses."
      role="instructor"
      href="/instructor/students"
      icon="GraduationCap"
      emptyTitle="Students module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
