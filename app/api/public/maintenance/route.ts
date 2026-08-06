import { NextResponse } from "next/server";

import { getMaintenancePublicStatus } from "@/services/support-ops";

/** Public maintenance status for middleware + maintenance page (no auth). */
export async function GET() {
  try {
    const data = getMaintenancePublicStatus();
    return NextResponse.json(
      { success: true, data, error: null },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch {
    return NextResponse.json({
      success: true,
      data: {
        enabled: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true",
        statusMessage: "AviatorPass is undergoing scheduled maintenance.",
        estimatedReturnAt: null,
        contactEmail: "",
        contactPhone: "",
        platformName: "AviatorPass",
      },
      error: null,
    });
  }
}
