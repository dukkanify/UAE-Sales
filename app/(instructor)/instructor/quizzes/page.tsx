import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Quizzes" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Quizzes"
      description="Design knowledge checks and assessments."
      role="instructor"
      href="/instructor/quizzes"
      icon="HelpCircle"
      emptyTitle="Quizzes module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
