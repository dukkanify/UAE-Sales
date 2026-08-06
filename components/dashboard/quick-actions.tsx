"use client";

import Link from "@/components/ui/app-link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
  className?: string;
}

function QuickActions({ title = "Quick actions", actions, className }: QuickActionsProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {actions.map((action, index) => (
          <motion.div
            key={action.href + action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Button
              asChild
              variant="outline"
              className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
            >
              <Link href={action.href}>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent">
                  <action.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{action.label}</span>
                  {action.description ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

export { QuickActions };
