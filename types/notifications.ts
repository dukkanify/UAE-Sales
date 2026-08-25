/**
 * Enterprise notification catalog — types, priorities, categories, delivery rules.
 */

export type NotificationPriority = "critical" | "high" | "medium" | "low" | "informational";

export type NotificationCategory =
  | "security"
  | "account"
  | "course"
  | "booking"
  | "payment"
  | "reminder"
  | "message"
  | "assignment"
  | "system"
  | "marketing"
  | "ops";

export type NotificationStatus = "unread" | "read" | "archived" | "deleted";

export type DeliveryUrgency = "immediate" | "grouped" | "digest";

export interface NotificationTypeDefinition {
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  delivery: DeliveryUrgency;
  /** Send email when user allows transactional / security email */
  emailDefault: boolean;
  groupKey?: string;
  defaultTitle: string;
  defaultBody: string;
  audiences: Array<"student" | "instructor" | "cgi" | "admin" | "super_admin" | "all">;
}

/** Canonical type registry — every emitter should use these keys. */
export const NOTIFICATION_CATALOG: Record<string, NotificationTypeDefinition> = {
  // Student / account
  "account.created": {
    type: "account.created",
    category: "account",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Account created",
    defaultBody: "Welcome to ATPL PASS — your account is ready.",
    audiences: ["all"],
  },
  "account.email_verified": {
    type: "account.email_verified",
    category: "account",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Email verified",
    defaultBody: "Your email address has been verified.",
    audiences: ["all"],
  },
  "account.otp_sent": {
    type: "account.otp_sent",
    category: "security",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Verification code sent",
    defaultBody: "A one-time verification code was sent to your email.",
    audiences: ["all"],
  },
  "account.password_changed": {
    type: "account.password_changed",
    category: "security",
    priority: "critical",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Password changed",
    defaultBody: "Your password was changed. If this wasn’t you, contact support.",
    audiences: ["all"],
  },
  "account.welcome": {
    type: "account.welcome",
    category: "account",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Welcome aboard",
    defaultBody: "Your ATPL PASS account is ready. Open your dashboard to continue.",
    audiences: ["student"],
  },
  "account.profile_updated": {
    type: "account.profile_updated",
    category: "account",
    priority: "low",
    delivery: "digest",
    emailDefault: false,
    defaultTitle: "Profile updated",
    defaultBody: "Your profile details were saved.",
    audiences: ["all"],
  },
  "security.login_new_device": {
    type: "security.login_new_device",
    category: "security",
    priority: "critical",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "New device login",
    defaultBody: "A new device signed in to your account.",
    audiences: ["all"],
  },
  "security.alert": {
    type: "security.alert",
    category: "security",
    priority: "critical",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Security alert",
    defaultBody: "We detected unusual activity on your account.",
    audiences: ["all"],
  },

  // Enrollment / courses
  "course.atpl_enrolled": {
    type: "course.atpl_enrolled",
    category: "course",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "ATPL enrollment confirmed",
    defaultBody: "You are enrolled in the ATPL program.",
    audiences: ["student"],
  },
  "course.access_granted": {
    type: "course.access_granted",
    category: "course",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Course access granted",
    defaultBody: "You can now access your course materials.",
    audiences: ["student"],
  },
  "course.subject_unlocked": {
    type: "course.subject_unlocked",
    category: "course",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    groupKey: "course.subject_unlocked",
    defaultTitle: "Subject unlocked",
    defaultBody: "A new ATPL subject is available.",
    audiences: ["student"],
  },
  "course.progress_milestone": {
    type: "course.progress_milestone",
    category: "course",
    priority: "medium",
    delivery: "grouped",
    emailDefault: false,
    groupKey: "course.progress_milestone",
    defaultTitle: "Progress milestone",
    defaultBody: "You reached a learning milestone in your ATPL program.",
    audiences: ["student"],
  },

  // Payments
  "payment.succeeded": {
    type: "payment.succeeded",
    category: "payment",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Payment successful",
    defaultBody: "Your payment was processed successfully.",
    audiences: ["student", "admin", "super_admin"],
  },
  "payment.failed": {
    type: "payment.failed",
    category: "payment",
    priority: "critical",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Payment failed",
    defaultBody: "We couldn’t process your payment. Please try again.",
    audiences: ["student", "admin", "super_admin"],
  },
  "invoice.generated": {
    type: "invoice.generated",
    category: "payment",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Invoice generated",
    defaultBody: "A new invoice is ready for you.",
    audiences: ["student", "admin", "super_admin"],
  },
  "payout.completed": {
    type: "payout.completed",
    category: "payment",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Payment released",
    defaultBody: "Funds were released to your wallet.",
    audiences: ["instructor"],
  },
  "wallet.updated": {
    type: "wallet.updated",
    category: "payment",
    priority: "medium",
    delivery: "grouped",
    emailDefault: false,
    groupKey: "wallet.updated",
    defaultTitle: "Wallet updated",
    defaultBody: "Your instructor wallet balance changed.",
    audiences: ["instructor"],
  },

  // Live classes / Zoom
  "class.scheduled": {
    type: "class.scheduled",
    category: "booking",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Zoom session scheduled",
    defaultBody: "A live session has been scheduled.",
    audiences: ["student", "instructor"],
  },
  "class.reminder_24h": {
    type: "class.reminder_24h",
    category: "reminder",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Session in 24 hours",
    defaultBody: "Your live session starts in 24 hours.",
    audiences: ["student", "instructor"],
  },
  "class.reminder_2h": {
    type: "class.reminder_2h",
    category: "reminder",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Session in 2 hours",
    defaultBody: "Your live session starts in 2 hours.",
    audiences: ["student", "instructor"],
  },
  "class.started": {
    type: "class.started",
    category: "booking",
    priority: "high",
    delivery: "immediate",
    emailDefault: false,
    defaultTitle: "Session started",
    defaultBody: "Your live session is live now.",
    audiences: ["student", "instructor"],
  },
  "class.cancelled": {
    type: "class.cancelled",
    category: "booking",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Session cancelled",
    defaultBody: "A live session was cancelled.",
    audiences: ["student", "instructor", "cgi"],
  },
  "class.rescheduled": {
    type: "class.rescheduled",
    category: "booking",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Session rescheduled",
    defaultBody: "A live session was rescheduled.",
    audiences: ["student", "instructor", "cgi"],
  },
  "class.created": {
    type: "class.created",
    category: "booking",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "New live class",
    defaultBody: "A new live class was published.",
    audiences: ["student", "instructor"],
  },
  "class.updated": {
    type: "class.updated",
    category: "booking",
    priority: "medium",
    delivery: "grouped",
    emailDefault: false,
    defaultTitle: "Class updated",
    defaultBody: "A live class was updated.",
    audiences: ["student", "instructor"],
  },

  // Assignments / quizzes / exams
  "assignment.published": {
    type: "assignment.published",
    category: "assignment",
    priority: "medium",
    delivery: "grouped",
    emailDefault: true,
    groupKey: "assignment.published",
    defaultTitle: "Assignment published",
    defaultBody: "A new assignment is available.",
    audiences: ["student"],
  },
  "assignment.deadline": {
    type: "assignment.deadline",
    category: "reminder",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    groupKey: "assignment.deadline",
    defaultTitle: "Assignment deadline soon",
    defaultBody: "An assignment deadline is approaching.",
    audiences: ["student"],
  },
  "assignment.graded": {
    type: "assignment.graded",
    category: "assignment",
    priority: "medium",
    delivery: "grouped",
    emailDefault: true,
    groupKey: "assignment.graded",
    defaultTitle: "Assignment graded",
    defaultBody: "Your assignment was graded.",
    audiences: ["student"],
  },
  "assignment.submitted": {
    type: "assignment.submitted",
    category: "assignment",
    priority: "medium",
    delivery: "grouped",
    emailDefault: false,
    groupKey: "assignment.submitted",
    defaultTitle: "Student submitted assignment",
    defaultBody: "A student submitted an assignment.",
    audiences: ["instructor"],
  },
  "quiz.available": {
    type: "quiz.available",
    category: "course",
    priority: "medium",
    delivery: "grouped",
    emailDefault: true,
    groupKey: "quiz.available",
    defaultTitle: "Quiz available",
    defaultBody: "A new quiz is ready for you.",
    audiences: ["student"],
  },
  "quiz.result": {
    type: "quiz.result",
    category: "course",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Quiz result",
    defaultBody: "Your quiz result is available.",
    audiences: ["student"],
  },
  "mock_exam.available": {
    type: "mock_exam.available",
    category: "course",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Mock exam available",
    defaultBody: "A mock exam booking slot is open.",
    audiences: ["student"],
  },
  "mock_exam.booked": {
    type: "mock_exam.booked",
    category: "booking",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Mock exam booked",
    defaultBody: "Your mock exam booking is confirmed.",
    audiences: ["student", "instructor"],
  },
  "certificate.issued": {
    type: "certificate.issued",
    category: "course",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Certificate issued",
    defaultBody: "Your certificate is ready to download.",
    audiences: ["student", "admin", "super_admin"],
  },
  "instructor.feedback": {
    type: "instructor.feedback",
    category: "course",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Instructor feedback",
    defaultBody: "You received new instructor feedback.",
    audiences: ["student"],
  },

  // Messaging / support
  "message.new": {
    type: "message.new",
    category: "message",
    priority: "medium",
    delivery: "grouped",
    emailDefault: false,
    groupKey: "message.new",
    defaultTitle: "New message",
    defaultBody: "You have a new message.",
    audiences: ["all"],
  },
  "ticket.reply": {
    type: "ticket.reply",
    category: "message",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Support ticket reply",
    defaultBody: "Support replied to your ticket.",
    audiences: ["all"],
  },
  "ticket.created": {
    type: "ticket.created",
    category: "ops",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Support ticket created",
    defaultBody: "A new support ticket was opened.",
    audiences: ["admin", "super_admin"],
  },
  "ticket.updated": {
    type: "ticket.updated",
    category: "message",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Support ticket updated",
    defaultBody: "Your support ticket status changed.",
    audiences: ["all"],
  },
  "message.group_added": {
    type: "message.group_added",
    category: "message",
    priority: "medium",
    delivery: "immediate",
    emailDefault: false,
    defaultTitle: "Added to conversation",
    defaultBody: "You were added to a group conversation.",
    audiences: ["all"],
  },
  "document.shared": {
    type: "document.shared",
    category: "message",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Document shared",
    defaultBody: "A training document was shared with you in chat.",
    audiences: ["all"],
  },

  // Instructor / CGI
  "instructor.student_assigned": {
    type: "instructor.student_assigned",
    category: "course",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "New student assigned",
    defaultBody: "A student was assigned to you.",
    audiences: ["instructor"],
  },
  "instructor.private_session_booked": {
    type: "instructor.private_session_booked",
    category: "booking",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Private session booked",
    defaultBody: "A student booked a private session.",
    audiences: ["instructor"],
  },
  "instructor.student_question": {
    type: "instructor.student_question",
    category: "message",
    priority: "medium",
    delivery: "grouped",
    emailDefault: false,
    groupKey: "instructor.student_question",
    defaultTitle: "Student question",
    defaultBody: "A student asked a question.",
    audiences: ["instructor"],
  },
  "instructor.report_due": {
    type: "instructor.report_due",
    category: "reminder",
    priority: "medium",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Performance report due",
    defaultBody: "A performance report is due soon.",
    audiences: ["instructor"],
  },
  "cgi.instructor_assignment": {
    type: "cgi.instructor_assignment",
    category: "course",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Instructor assignment",
    defaultBody: "An instructor assignment needs your attention.",
    audiences: ["cgi"],
  },
  "cgi.schedule_conflict": {
    type: "cgi.schedule_conflict",
    category: "booking",
    priority: "critical",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Schedule conflict",
    defaultBody: "A schedule conflict was detected.",
    audiences: ["cgi"],
  },
  "cgi.progress_warning": {
    type: "cgi.progress_warning",
    category: "course",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Student progress warning",
    defaultBody: "A student may need intervention.",
    audiences: ["cgi"],
  },

  // Admin / Super Admin / system
  "admin.registration": {
    type: "admin.registration",
    category: "ops",
    priority: "medium",
    delivery: "grouped",
    emailDefault: false,
    groupKey: "admin.registration",
    defaultTitle: "New registration",
    defaultBody: "A new user registered.",
    audiences: ["admin", "super_admin"],
  },
  "system.maintenance": {
    type: "system.maintenance",
    category: "system",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "System maintenance",
    defaultBody: "Scheduled maintenance is upcoming.",
    audiences: ["all"],
  },
  "system.error": {
    type: "system.error",
    category: "ops",
    priority: "critical",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "System error",
    defaultBody: "A system error was recorded.",
    audiences: ["admin", "super_admin"],
  },
  "ops.deployment": {
    type: "ops.deployment",
    category: "ops",
    priority: "medium",
    delivery: "immediate",
    emailDefault: false,
    defaultTitle: "Deployment status",
    defaultBody: "A deployment event was recorded.",
    audiences: ["super_admin"],
  },
  "ops.health": {
    type: "ops.health",
    category: "ops",
    priority: "high",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "System health alert",
    defaultBody: "Platform health needs attention.",
    audiences: ["super_admin"],
  },
  "ops.backup": {
    type: "ops.backup",
    category: "ops",
    priority: "medium",
    delivery: "digest",
    emailDefault: false,
    defaultTitle: "Backup status",
    defaultBody: "A backup job completed.",
    audiences: ["super_admin"],
  },
  "ops.email_failure": {
    type: "ops.email_failure",
    category: "ops",
    priority: "critical",
    delivery: "immediate",
    emailDefault: false,
    defaultTitle: "Email delivery failure",
    defaultBody: "An outbound email failed.",
    audiences: ["admin", "super_admin"],
  },
  "ops.zoom_failure": {
    type: "ops.zoom_failure",
    category: "ops",
    priority: "critical",
    delivery: "immediate",
    emailDefault: true,
    defaultTitle: "Zoom failure",
    defaultBody: "A Zoom integration error occurred.",
    audiences: ["admin", "super_admin"],
  },
  "announcement.published": {
    type: "announcement.published",
    category: "system",
    priority: "medium",
    delivery: "immediate",
    emailDefault: false,
    defaultTitle: "Announcement",
    defaultBody: "A new announcement was published.",
    audiences: ["all"],
  },
  system: {
    type: "system",
    category: "system",
    priority: "informational",
    delivery: "digest",
    emailDefault: false,
    defaultTitle: "System update",
    defaultBody: "A system update is available.",
    audiences: ["all"],
  },
};

export function resolveNotificationType(type: string): NotificationTypeDefinition {
  if (NOTIFICATION_CATALOG[type]) return NOTIFICATION_CATALOG[type];
  // Map legacy class.reminder.* and payment.* variants
  if (type.startsWith("class.reminder")) {
    return (
      NOTIFICATION_CATALOG["class.reminder_24h"] ?? {
        type,
        category: "reminder",
        priority: "medium",
        delivery: "immediate",
        emailDefault: true,
        defaultTitle: "Class reminder",
        defaultBody: "You have an upcoming class.",
        audiences: ["all"],
      }
    );
  }
  return {
    type,
    category: "system",
    priority: "informational",
    delivery: "digest",
    emailDefault: false,
    groupKey: type.split(".")[0],
    defaultTitle: type.replaceAll(".", " ").replaceAll("_", " "),
    defaultBody: "",
    audiences: ["all"],
  };
}

export function priorityRank(p: NotificationPriority): number {
  switch (p) {
    case "critical":
      return 5;
    case "high":
      return 4;
    case "medium":
      return 3;
    case "low":
      return 2;
    default:
      return 1;
  }
}
