import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Calendar" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Calendar"
      description="Classes, deadlines, and study blocks in one place."
      role="student"
      href="/student/calendar"
      icon="CalendarDays"
      emptyTitle="Calendar module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
