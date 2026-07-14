import type { MetadataRoute } from "next";
import { BRAND } from "@/shared/constants/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#FAF9F7",
    description: BRAND.description,
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "any",
        src: "/brand/app-icon.svg",
        type: "image/svg+xml",
      },
    ],
    lang: "ar",
    name: `${BRAND.nameAr} — ${BRAND.nameEn}`,
    orientation: "portrait",
    short_name: BRAND.nameAr,
    start_url: "/",
    theme_color: "#0B1628",
  };
}
