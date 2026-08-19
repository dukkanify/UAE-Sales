import { NextResponse } from "next/server";
import { getProductionConfigSnapshot } from "@/services/auth/production-config";
import {
  AuthStoreError,
  getAuthPersistenceInfo,
} from "@/services/auth/user-persistence";

export async function GET() {
  const config = getProductionConfigSnapshot();

  try {
    const persistence = await getAuthPersistenceInfo();
    return NextResponse.json({
      ok: true,
      config,
      persistence,
    });
  } catch (error) {
    const message =
      error instanceof AuthStoreError
        ? error.message
        : error instanceof Error
          ? error.message
          : "AUTH_STORE_UNAVAILABLE";

    return NextResponse.json(
      {
        ok: false,
        config,
        persistence: null,
        error: message,
      },
      { status: config.databaseConfigured ? 503 : 503 },
    );
  }
}
