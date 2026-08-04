"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/layout/mobile-sidebar-sheet";
import { useAuth } from "@/providers/auth-provider";
import { ROLE_LABELS, type Role } from "@/constants/roles";
import { routes } from "@/constants/routes";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Menu } from "lucide-react";

export interface RoleNavItem {
  label: string;
  href: string;
  icon: "dashboard" | "users" | "courses" | "settings" | "activity" | "wallet" | "bell";
}

const iconMap = {
  dashboard: LayoutDashboard,
  users: Users,
  courses: BookOpen,
  settings: Settings,
  activity: Activity,
  wallet: Wallet,
  bell: Bell,
};

interface RoleShellProps {
  role: Role;
  navItems: RoleNavItem[];
  children: React.ReactNode;
}

function RoleSidebar({
  role,
  navItems,
  className,
}: {
  role: Role;
  navItems: RoleNavItem[];
  className?: string;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Link href="/" className="font-display text-sm font-semibold">
          {siteConfig.name}
        </Link>
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="px-4 py-3">
        <p className="text-xs uppercase tracking-wider text-sidebar-foreground/50">
          {ROLE_LABELS[role]}
        </p>
        <p className="truncate text-sm font-medium">
          {user?.fullName || user?.email || "Account"}
        </p>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={async () => {
            await signOut();
            router.replace(routes.login);
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}

function RoleShell({ role, navItems, children }: RoleShellProps) {
  const { user } = useAuth();
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "EP";

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <RoleSidebar role={role} navItems={navItems} className="fixed inset-y-0 left-0 z-30" />
      </div>
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <RoleSidebar role={role} navItems={navItems} className="border-0" />
              </SheetContent>
            </Sheet>
            <p className="font-display text-sm font-semibold text-primary lg:hidden">
              {ROLE_LABELS[role]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export { RoleShell };
