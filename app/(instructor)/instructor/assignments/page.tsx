import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Assignments" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Assignments"
      description="Create and review student assignments."
      role="instructor"
      href="/instructor/assignments"
      icon="ClipboardList"
      emptyTitle="Assignments module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
