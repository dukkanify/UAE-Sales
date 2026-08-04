import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Community" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Community"
      description="Connect with fellow aviation learners."
      role="student"
      href="/student/community"
      icon="Users"
      emptyTitle="Community module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
