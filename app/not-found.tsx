import { SystemPage } from "@/components/shared/system-page";
import { routes } from "@/constants/routes";

export default function NotFound() {
  return (
    <SystemPage
      code="404"
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
      actionHref={routes.home}
    />
  );
}
