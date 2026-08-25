import { redirect } from "next/navigation";

import { LearningDashboardView } from "@/features/learning";
import { routes } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { getCurrentSession } from "@/services/auth/auth-service";

export default async function StudentDashboardPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect(routes.login);
  if (user.role !== ROLES.STUDENT) redirect(routes.accessDenied);

  return <LearningDashboardView />;
}
