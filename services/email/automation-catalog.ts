import type { EmailAutomationCatalogItem } from "@/types/email-automation";

export const EMAIL_AUTOMATION_CATALOG: EmailAutomationCatalogItem[] = [
  {
    event: "registration",
    label: "Registration",
    description: "Welcome email after account verification / signup.",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "payment",
    label: "Payment",
    description: "Payment succeeded, failed, or installment received.",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "assignment",
    label: "Assignment",
    description: "Instructor or lecture assignment confirmed.",
    audience: "instructor",
    defaultEnabled: true,
  },
  {
    event: "reminder",
    label: "Reminder",
    description: "Class or installment reminders (also used by queues).",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "certificate",
    label: "Certificate",
    description: "Certificate issued or approved.",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "homework",
    label: "Homework",
    description: "Homework assigned after a lecture / performance report.",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "schedule",
    label: "Schedule",
    description: "New live class / ATPL session scheduled.",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "reschedule",
    label: "Reschedule",
    description: "Session moved to a new time.",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "cancel",
    label: "Cancel",
    description: "Session cancelled.",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "invoice",
    label: "Invoice",
    description: "Invoice issued for a paid order.",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "receipt",
    label: "Receipt",
    description: "Payment receipt confirmation.",
    audience: "student",
    defaultEnabled: true,
  },
  {
    event: "admin_alert",
    label: "Admin alerts",
    description: "Operational alerts for admin / super admin.",
    audience: "admin",
    defaultEnabled: true,
  },
  {
    event: "instructor_alert",
    label: "Instructor alerts",
    description: "Operational alerts for instructors.",
    audience: "instructor",
    defaultEnabled: true,
  },
  {
    event: "student_alert",
    label: "Student alerts",
    description: "General student account alerts.",
    audience: "student",
    defaultEnabled: true,
  },
];

export function getCatalogItem(event: string) {
  return EMAIL_AUTOMATION_CATALOG.find((c) => c.event === event) ?? null;
}
