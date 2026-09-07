import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import {
  activityTypeOptions,
  getActivitiesForAdmin,
} from "@/services/activity/activity-service";
import type { ActivityKind, ActivityScope } from "@/types/domain/activity";

const querySchema = z.object({
  scope: z.enum(["mine", "received", "all"]).optional(),
  kind: z
    .enum([
      "job_application",
      "viewing_booking",
      "quote_request",
      "service_booking",
      "order",
      "listing",
      "dispute",
    ])
    .optional(),
  status: z.string().optional(),
  query: z.string().optional(),
  emirate: z.string().optional(),
  categoryId: z.string().optional(),
  userId: z.string().optional(),
  sellerId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
});

export async function GET(request: Request) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) return admin;

  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const result = await getActivitiesForAdmin({
    ...parsed.data,
    scope: (parsed.data.scope ?? "all") as ActivityScope | "all",
    kind: parsed.data.kind as ActivityKind | undefined,
  });

  return NextResponse.json({
    ...result,
    filters: {
      kinds: activityTypeOptions(),
    },
  });
}
