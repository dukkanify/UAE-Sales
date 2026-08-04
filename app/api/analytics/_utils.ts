import { NextResponse } from "next/server";

import { AnalyticsError } from "@/services/analytics/access";
import { authErrorResponse } from "@/services/auth/guards";

export function analyticsErrorResponse(error: unknown) {
  if (error instanceof AnalyticsError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return authErrorResponse(error);
}

export function parseFilters(searchParams: URLSearchParams) {
  return {
    dateFrom: searchParams.get("dateFrom"),
    dateTo: searchParams.get("dateTo"),
    courseId: searchParams.get("courseId"),
    instructorId: searchParams.get("instructorId"),
    studentId: searchParams.get("studentId"),
    categoryId: searchParams.get("categoryId"),
    status: searchParams.get("status"),
    revenueSource: searchParams.get("revenueSource"),
  };
}
