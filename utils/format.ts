import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(date: string | Date, pattern = "MMM d, yyyy"): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, pattern);
}

export function formatRelative(date: string | Date): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(value, { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
