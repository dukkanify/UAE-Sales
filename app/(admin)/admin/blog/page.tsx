import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Blog" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Blog"
      description="Review and publish training articles."
      role="admin"
      href="/admin/blog"
      icon="FileText"
      emptyTitle="Blog module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
