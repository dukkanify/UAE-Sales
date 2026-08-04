import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  Inbox,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import type { EmptyStatePreset } from "@/config/design-system";

const PRESETS: Record<
  EmptyStatePreset,
  { icon: LucideIcon; title: string; description: string }
> = {
  courses: {
    icon: BookOpen,
    title: "No courses yet",
    description: "Courses will appear here once they are published.",
  },
  students: {
    icon: Users,
    title: "No students found",
    description: "Invite learners or adjust your filters to see results.",
  },
  notifications: {
    icon: Bell,
    title: "No notifications",
    description: "You're all caught up. New alerts will show up here.",
  },
  calendar: {
    icon: CalendarDays,
    title: "No calendar events",
    description: "Upcoming classes and deadlines will appear on your calendar.",
  },
  messages: {
    icon: MessageSquare,
    title: "No messages",
    description: "Conversations with instructors and peers will show here.",
  },
  community: {
    icon: Users,
    title: "No community posts",
    description: "Be the first to start a discussion when communities launch.",
  },
  reports: {
    icon: FileBarChart,
    title: "No reports available",
    description: "Analytics and exports will populate as activity grows.",
  },
  generic: {
    icon: Inbox,
    title: "Nothing here yet",
    description: "Content for this section will appear when available.",
  },
};

interface PresetEmptyStateProps {
  preset: EmptyStatePreset;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function PresetEmptyState({ preset, actionLabel, onAction, className }: PresetEmptyStateProps) {
  const config = PRESETS[preset] ?? PRESETS.generic;
  const Icon = config.icon;
  return (
    <EmptyState
      className={className}
      icon={<Icon className="h-6 w-6" />}
      title={config.title}
      description={config.description}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}

function AssignmentsEmptyState(props: {
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      className={props.className}
      icon={<ClipboardList className="h-6 w-6" />}
      title="No assignments"
      description="Assigned coursework will appear here."
      actionLabel={props.actionLabel}
      onAction={props.onAction}
    />
  );
}

export { PresetEmptyState, AssignmentsEmptyState, PRESETS };
