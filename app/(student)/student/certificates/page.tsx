import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Certificates" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Certificates"
      description="Earned credentials will be listed here."
      role="student"
      href="/student/certificates"
      icon="Award"
      emptyTitle="Certificates module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
