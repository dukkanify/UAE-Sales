import type { MetadataRoute } from "next";
import { getCategories } from "@/services/categories";
import { getListings } from "@/services/listings";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, listings] = await Promise.all([
    getCategories(),
    getListings(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/categories",
    "/search",
    "/featured",
    "/escrow",
    "/login",
    "/register",
    "/terms",
    "/privacy",
    "/escrow-policy",
    "/refund-policy",
    "/contact",
    "/safety",
    "/support",
  ].map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${appUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const listingRoutes = listings.slice(0, 200).map((listing) => ({
    url: `${appUrl}/listings/${listing.slug}`,
    lastModified: new Date(listing.postedAt ?? Date.now()),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
