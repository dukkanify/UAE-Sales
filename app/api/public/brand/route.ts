import { NextResponse } from "next/server";

import { getPublicBrandConfig } from "@/services/settings/settings-service";
import { siteConfig } from "@/config/site";

/** Public brand snapshot for logos, footer, and SEO consumers. */
export async function GET() {
  const brand = getPublicBrandConfig();
  return NextResponse.json({
    success: true,
    data: {
      ...brand,
      metaDescription: siteConfig.description,
    },
    error: null,
  });
}
