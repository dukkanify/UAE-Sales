import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.legalName,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F3F4F6",
    theme_color: "#2E7DAA",
    lang: "en",
    icons: [
      {
        src: "/brand/icon.png",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
