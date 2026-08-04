"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Shield,
  Users,
  UserRound,
  GraduationCap,
  Wallet,
  CreditCard,
  Bell,
  BarChart3,
  Layers,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/search-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/layout/mobile-sidebar-sheet";
import { useAuth } from "@/providers/auth-provider";
import { ROLE_LABELS, type Role } from "@/constants/roles";
import { routes } from "@/constants/routes";
import { DASHBOARD_NAV, type DashboardIcon, type DashboardNavItem } from "@/constants/dashboard-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const iconMap: Record<DashboardIcon, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  users: Users,
  admins: Shield,
  instructors: GraduationCap,
  students: UserRound,
  courses: BookOpen,
  classes: Layers,
  lessons: FileText,
  communities: UsersRound,
  blog: MessageSquare,
  payments: CreditCard,
  wallets: Wallet,
  reports: BarChart3,
  settings: Settings,
  logs: Activity,
  notifications: Bell,
  profile: UserRound,
  calendar: CalendarDays,
  assignments: ClipboardList,
  quizzes: HelpCircle,
  certificates: Award,
  wallet: Wallet,
  activity: Activity,
};

interface RoleShellProps {
  role: Role;
  navItems?: DashboardNavItem[];
  children: React.ReactNode;
}

function RoleSidebar({
  role,
  navItems,
  collapsed,
  className,
}: {
  role: Role;
  navItems: DashboardNavItem[];
  collapsed?: boolean;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-[72px]" : "w-64",
        className,
      )}
    >
      <div className={cn("flex h-16 items-center gap-2.5 px-4", collapsed && "justify-center px-2")}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Globe className="h-4 w-4" />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">{siteConfig.name}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/55">{ROLE_LABELS[role]}</p>
          </div>
        ) : null}
      </div>
      <Separator className="bg-sidebar-border" />
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="space-y-0.5" aria-label={`${ROLE_LABELS[role]} navigation`}>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}

function ProfileMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "EP";
  const profileHref = user ? `/${user.role === "super_admin" ? "super-admin" : user.role}/profile` : routes.login;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[120px] truncate text-sm md:inline">
            {user?.fullName || user?.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate font-medium">{user?.fullName || "Account"}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={profileHref}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={profileHref}>Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.replace(routes.login);
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageSelector() {
  const [lang, setLang] = React.useState("en");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline uppercase">{lang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("ar")}>العربية</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("fr")}>Français</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RoleShell({ role, navItems, children }: RoleShellProps) {
  const items = navItems ?? DASHBOARD_NAV[role];
  const [collapsed, setCollapsed] = React.useState(false);
  const [search, setSearch] = React.useState("");

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <RoleSidebar
          role={role}
          navItems={items}
          collapsed={collapsed}
          className="fixed inset-y-0 left-0 z-30"
        />
      </div>

      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64",
        )}
      >
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md">
          <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <RoleSidebar role={role} navItems={items} className="border-0" />
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>

            <div className="hidden min-w-0 flex-1 md:block md:max-w-md">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search dashboard..."
                aria-label="Global search"
              />
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <NotificationBell />
              <ProfileMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export { RoleShell };
export type { DashboardNavItem as RoleNavItem };
