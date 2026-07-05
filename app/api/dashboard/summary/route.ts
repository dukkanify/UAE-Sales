import { getDashboardSummaryFromDb } from "@/lib/repositories/listings.repository";
import { requireAuth } from "@/lib/auth/guards";
import {
  mockDashboardNotifications,
  mockDashboardQuickActions,
  mockDashboardRecentActivity,
  mockDashboardSummaryCards,
  mockDashboardViewsChart,
} from "@/mock/dashboard.mock";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function GET() {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const summary = await getDashboardSummaryFromDb(user.id);

    return jsonSuccess({
      summary,
      viewsChart: mockDashboardViewsChart,
      quickActions: mockDashboardQuickActions,
      summaryCards: mockDashboardSummaryCards.map((card) => {
        if (card.href === "/wallet") {
          return {
            ...card,
            value: `${summary.walletBalance.toLocaleString("ar-AE")} د.إ`,
          };
        }
        if (card.href === "/dashboard/listings") {
          return { ...card, value: String(summary.totalViews) };
        }
        if (card.href === "/chat") {
          return { ...card, value: String(summary.unreadMessages) };
        }
        return card;
      }),
      recentActivity: mockDashboardRecentActivity,
      notifications: mockDashboardNotifications,
    });
  });
}
