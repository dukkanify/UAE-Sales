import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Blog" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Blog"
      description="Editorial workflow and publishing controls come next."
      role="super-admin"
      href="/super-admin/blog"
      icon="FileText"
      emptyTitle="Blog module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
