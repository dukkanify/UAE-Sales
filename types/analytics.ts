/**
 * Analytics / BI domain types.
 */

export type AnalyticsScope =
  | "executive"
  | "learning"
  | "instructor"
  | "student"
  | "financial"
  | "course"
  | "live"
  | "community"
  | "support"
  | "health";

export type ReportFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type ChartKind = "line" | "bar" | "pie" | "area" | "heatmap" | "kpi";

export interface AnalyticsFilters {
  dateFrom?: string | null;
  dateTo?: string | null;
  courseId?: string | null;
  instructorId?: string | null;
  studentId?: string | null;
  categoryId?: string | null;
  status?: string | null;
  revenueSource?: string | null;
}

export interface KpiCard {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  delta?: number | null;
  trend?: "up" | "down" | "flat" | null;
  format?: "number" | "percent" | "currency" | "duration" | "text";
}

export interface ChartSeries {
  id: string;
  title: string;
  kind: ChartKind;
  points: Array<{ name: string; value: number; secondary?: number }>;
}

export interface DashboardWidget {
  id: string;
  scope: AnalyticsScope;
  title: string;
  kind: "kpi" | "chart" | "table";
  chartId?: string;
  kpiIds?: string[];
  order: number;
  visible: boolean;
  pinned: boolean;
}

export interface UserDashboardPrefs {
  userId: string;
  widgets: DashboardWidget[];
  savedFilters: Array<{ id: string; name: string; filters: AnalyticsFilters }>;
  favoriteDashboardIds: string[];
  updatedAt: string;
}

export interface SavedReport {
  id: string;
  name: string;
  scope: AnalyticsScope;
  filters: AnalyticsFilters;
  createdById: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  scope: AnalyticsScope;
  frequency: ReportFrequency;
  recipients: string[];
  filters: AnalyticsFilters;
  enabled: boolean;
  createdById: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportHistoryEntry {
  id: string;
  reportName: string;
  scope: AnalyticsScope;
  format: "csv" | "pdf" | "xlsx" | "print";
  generatedById: string;
  filters: AnalyticsFilters;
  rowCount: number;
  createdAt: string;
}

export interface AnalyticsCacheEntry {
  key: string;
  payload: unknown;
  expiresAt: string;
  updatedAt: string;
}

export interface ExecutiveAnalytics {
  kpis: KpiCard[];
  charts: ChartSeries[];
  generatedAt: string;
}

export interface LearningAnalytics {
  kpis: KpiCard[];
  charts: ChartSeries[];
  courses: Array<{
    courseId: string;
    title: string;
    enrollments: number;
    completionRate: number;
    avgProgress: number;
    dropOffRate: number;
  }>;
}

export interface InstructorAnalytics {
  instructorId: string;
  instructorName: string;
  kpis: KpiCard[];
  charts: ChartSeries[];
}

export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  kpis: KpiCard[];
  charts: ChartSeries[];
}

export interface FinancialAnalytics {
  kpis: KpiCard[];
  charts: ChartSeries[];
  topCourses: Array<{ name: string; revenue: number; orders: number }>;
  byInstructor: Array<{ name: string; lifetime: number; available: number }>;
}

export interface LiveClassAnalytics {
  kpis: KpiCard[];
  charts: ChartSeries[];
}

export interface CommunityAnalytics {
  kpis: KpiCard[];
  charts: ChartSeries[];
  topCommunities: Array<{ name: string; members: number; posts: number }>;
}

export interface SupportAnalytics {
  kpis: KpiCard[];
  charts: ChartSeries[];
  byCategory: Array<{ type: string; count: number }>;
}

export interface PlatformHealthAnalytics {
  kpis: KpiCard[];
  charts: ChartSeries[];
  warnings: string[];
  zoomStatus: string;
  storageMb: number;
  onlineUsers: number;
}
