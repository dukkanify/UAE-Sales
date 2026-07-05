import {
  galleryFromPool,
  type ImageFallbackCategory,
} from "@/shared/constants/image-fallbacks";

const slugCategories: Record<string, ImageFallbackCategory> = {
  "mercedes-amg-g63-2024": "cars",
  "toyota-land-cruiser-2023": "cars",
  "nissan-patrol-platinum-2022": "cars",
  "bmw-x7-2023": "cars",
  "tesla-model-y-2024": "cars",
  "villa-palm-jumeirah": "real-estate",
  "apartment-downtown-dubai": "real-estate",
  "townhouse-arabian-ranches": "real-estate",
  "office-business-bay": "real-estate",
  "studio-jvc": "real-estate",
  "iphone-16-pro-max-256gb": "mobiles",
  "samsung-galaxy-s25-ultra": "mobiles",
  "iphone-15-pro-128gb": "mobiles",
  "ipad-pro-m4-13-inch": "mobiles",
  "macbook-pro-m3-14-inch": "electronics",
  "sony-playstation-5": "electronics",
  "lg-oled-tv-65-inch": "electronics",
  "canon-eos-r6": "electronics",
  "bose-soundbar-900": "electronics",
  "apple-watch-ultra-2": "electronics",
  "luxury-italian-sofa-set": "furniture",
  "modern-dining-table-8-seater": "furniture",
  "master-bedroom-set-king": "furniture",
  "executive-office-desk": "furniture",
  "outdoor-garden-furniture-set": "furniture",
  "home-cleaning-service-dubai": "services",
  "villa-maintenance-service": "services",
  "car-detailing-premium": "services",
  "moving-service-uae": "services",
  "ac-repair-service": "services",
  "sales-executive-dubai": "jobs",
  "real-estate-agent-abu-dhabi": "jobs",
  "delivery-driver-sharjah": "jobs",
  "accountant-fujairah": "jobs",
  "graphic-designer-dubai": "jobs",
  "my-nissan-patrol-platinum-2022": "cars",
  "my-iphone-15-pro-sale": "mobiles",
  "my-dining-table-draft": "furniture",
  "my-studio-jvc-rent": "real-estate",
  "my-apple-watch-rejected": "electronics",
};

function buildListingImages(): Record<string, string[]> {
  const images: Record<string, string[]> = {};
  for (const [slug, category] of Object.entries(slugCategories)) {
    images[slug] = galleryFromPool(category, slug);
  }
  return images;
}

const listingImages = buildListingImages();

export function imagesForSlug(slug: string): string[] {
  if (listingImages[slug]?.length) {
    return listingImages[slug];
  }
  const category = slugCategories[slug] ?? "default";
  return galleryFromPool(category, slug);
}
