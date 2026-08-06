"use client";

import Link from "@/components/ui/app-link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { DASHBOARD_NAV_BY_ROLE } from "@/constants/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/auth-provider";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LayoutDashboard, Settings, User } from "lucide-react";

interface SidebarProps {
  className?: string;
}

function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = user ? DASHBOARD_NAV_BY_ROLE[user.role] : [];

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center gap-2.5 px-5">
        <BrandLogo variant="mark" href={routes.home} showWordmark />
      </div>

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1" aria-label="Dashboard">
          {items.map((item) => {
            const active =
              item.href === routes.dashboard
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.label.toLowerCase().includes("profile")
              ? User
              : item.label.toLowerCase().includes("setting")
                ? Settings
                : LayoutDashboard;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}

export { Sidebar };
