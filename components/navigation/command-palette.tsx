"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  Users,
  Bell,
  FileText,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/providers/auth-provider";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const router = useRouter();
  const { user } = useAuth();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const roleSegment =
    user?.role === "super_admin" ? "super-admin" : user?.role ?? "student";

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search navigation…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(`/${roleSegment}/dashboard`)}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(`/${roleSegment}/notifications`)}>
            <Bell className="h-4 w-4" />
            Notifications
          </CommandItem>
          <CommandItem onSelect={() => run(`/${roleSegment}/profile`)}>
            <Users className="h-4 w-4" />
            Profile
          </CommandItem>
        </CommandGroup>
        {user?.role === "super_admin" || user?.role === "admin" ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              <CommandItem onSelect={() => run(`/${roleSegment}/students`)}>
                <Users className="h-4 w-4" />
                Students
              </CommandItem>
              <CommandItem onSelect={() => run("/super-admin/settings")}>
                <Settings className="h-4 w-4" />
                Platform settings
              </CommandItem>
              <CommandItem onSelect={() => run("/design-system")}>
                <FileText className="h-4 w-4" />
                Design system
              </CommandItem>
            </CommandGroup>
          </>
        ) : (
          <>
            <CommandSeparator />
            <CommandGroup heading="Resources">
              <CommandItem onSelect={() => run("/design-system")}>
                <BookOpen className="h-4 w-4" />
                Design system
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export { CommandPalette };
