import type { MetadataRoute } from "next";
import { BRAND } from "@/shared/constants/brand";

export default function robots(): MetadataRoute.Robots {
  const base = `https://${BRAND.domain}`;
  return {
    rules: {
      allow: "/",
      disallow: ["/api/", "/admin/unauthorized"],
      userAgent: "*",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
