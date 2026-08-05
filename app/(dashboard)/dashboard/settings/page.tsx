import { redirect } from "next/navigation";

import { getCurrentSession } from "@/services/auth/auth-service";
import { ROLE_DASHBOARD } from "@/constants/roles";
import { routes } from "@/constants/routes";

export default async function LegacyDashboardSettingsRedirect() {
  const { user } = await getCurrentSession();
  if (!user) redirect(routes.login);
  redirect(ROLE_DASHBOARD[user.role]);
}
