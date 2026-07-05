import { isDatabaseConfigured } from "@/lib/prisma";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";

export async function GET() {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(
        503,
        "SERVER_ERROR",
        "قاعدة البيانات غير مهيأة.",
      );
    }

    return jsonSuccess({ status: "ok", database: true });
  });
}
