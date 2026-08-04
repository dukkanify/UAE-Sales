import Link from "next/link";
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Construction,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  ScrollText,
  Settings,
  Users,
  Video,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Construction,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  ScrollText,
  Settings,
  Users,
  Video,
  Wallet,
};

interface ModulePlaceholderProps {
  title: string;
  description: string;
  role: string;
  href: string;
  icon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; href: string };
}

function ModulePlaceholder({
  title,
  description,
  role,
  href,
  icon = "Construction",
  emptyTitle,
  emptyDescription,
  emptyAction,
}: ModulePlaceholderProps) {
  const Icon = ICON_MAP[icon] ?? Construction;
  const dashboardHref = `/${role}/dashboard`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Dashboard", href: dashboardHref },
          { label: title, href },
        ]}
        actions={
          emptyAction ? (
            <Button asChild>
              <Link href={emptyAction.href}>{emptyAction.label}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href={dashboardHref}>Back to dashboard</Link>
            </Button>
          )
        }
      />
      <EmptyState
        icon={<Icon className="h-6 w-6" />}
        title={emptyTitle ?? `${title} module shell`}
        description={
          emptyDescription ??
          "Navigation and permissions are ready. Business logic for this module will be implemented in a later milestone."
        }
      />
    </div>
  );
}

export { ModulePlaceholder };
