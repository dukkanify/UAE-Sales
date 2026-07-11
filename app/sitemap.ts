import type { MetadataRoute } from "next";
import { getAppUrl } from "@/shared/constants/site";
import { getCategories } from "@/services/categories";
import { getListings } from "@/services/listings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppUrl();
  const [categories, listings] = await Promise.all([
    getCategories(),
    getListings(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/categories",
    "/search",
    "/featured",
    "/login",
    "/register",
    "/escrow",
    "/support",
  ].map((path) => ({
    changeFrequency: path === "" ? "daily" : "weekly",
    lastModified: new Date(),
    priority: path === "" ? 1 : 0.8,
    url: `${base}${path}`,
  }));

  const categoryRoutes = categories.map((category) => ({
    changeFrequency: "weekly" as const,
    lastModified: new Date(),
    priority: 0.7,
    url: `${base}/categories/${category.slug}`,
  }));

  const listingRoutes = listings.slice(0, 100).map((listing) => ({
    changeFrequency: "weekly" as const,
    lastModified: new Date(listing.postedAt ?? Date.now()),
    priority: 0.6,
    url: `${base}/listings/${listing.slug}`,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
