import type { MetadataRoute } from "next";
import { getAppUrl } from "@/shared/constants/site";

export default function robots(): MetadataRoute.Robots {
  const base = getAppUrl();
  return {
    rules: {
      allow: "/",
      disallow: ["/api/", "/admin/unauthorized"],
      userAgent: "*",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
