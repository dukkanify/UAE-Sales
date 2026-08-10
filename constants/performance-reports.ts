import type { PerformanceRating } from "@/types/performance-reports";

export const PERFORMANCE_RATINGS: readonly PerformanceRating[] = [
  "excellent",
  "good",
  "satisfactory",
  "needs_improvement",
  "unsatisfactory",
] as const;

export const PERFORMANCE_RATING_LABELS: Record<PerformanceRating, string> = {
  excellent: "Excellent",
  good: "Good",
  satisfactory: "Satisfactory",
  needs_improvement: "Needs improvement",
  unsatisfactory: "Unsatisfactory",
};
