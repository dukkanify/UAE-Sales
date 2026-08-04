import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Calendar" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Calendar"
      description="Plan sessions and review your teaching schedule."
      role="instructor"
      href="/instructor/calendar"
      icon="CalendarDays"
      emptyTitle="Calendar module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
