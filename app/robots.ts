import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/student/",
          "/instructor/",
          "/admin/",
          "/super-admin/",
          "/api/",
          "/unauthorized",
          "/maintenance",
          "/account-suspended",
          "/access-denied",
          "/session-expired",
          "/offline",
          "/coming-soon",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
