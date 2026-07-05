import type { Category, Listing } from "@/types";

export function buildListingJsonLd(listing: Listing, appUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.imageUrl ? [listing.imageUrl] : undefined,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      availability: "https://schema.org/InStock",
      url: `${appUrl}/listings/${listing.slug}`,
    },
  };
}

export function buildCategoryJsonLd(category: Category, appUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    url: `${appUrl}/categories/${category.slug}`,
    description: `تصفح إعلانات ${category.name} في الإمارات عبر UAE Sales.`,
  };
}

export function buildOrganizationJsonLd(appUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "UAE Sales",
    url: appUrl,
    logo: `${appUrl}/favicon.ico`,
  };
}
