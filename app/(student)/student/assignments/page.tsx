import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Assignments" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Assignments"
      description="Upcoming and completed coursework."
      role="student"
      href="/student/assignments"
      icon="ClipboardList"
      emptyTitle="Assignments module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
