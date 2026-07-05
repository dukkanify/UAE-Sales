import {
  galleryFromPool,
  getCategoryFallbackUrl,
  getFallbackUrl,
  unsplashUrl,
  type ImageFallbackCategory,
} from "@/shared/constants/image-fallbacks";

export function unsplash(photoId: string, width = 1200): string {
  return unsplashUrl(photoId, width);
}

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

export const listingImages = buildListingImages();

export const sellerAvatars = {
  alNoorMotors: unsplashUrl("photo-1560179707-f14e90ef3623", 200),
  dubaiElite: unsplashUrl("photo-1560518883-ce09059eeffa", 200),
  gulfElectronics: unsplashUrl("photo-1560472354-b33ff0c44a43", 200),
  emiratesHome: unsplashUrl("photo-1581578731548-c64695cc6952", 200),
  goldenKey: unsplashUrl("photo-1573496359142-b8d87734a5a2", 200),
  khalidAlMansoori: unsplashUrl("photo-1507003211169-0a1dd7228f2d", 200),
  fatimaAlZaabi: unsplashUrl("photo-1494790108377-be9c29b29330", 200),
  omarHassan: unsplashUrl("photo-1472099645785-5658abf4ff4e", 200),
  priyaSharma: unsplashUrl("photo-1438761681033-6461ffad8d80", 200),
  ahmedAlMansoori: unsplashUrl("photo-1500648767791-00dcc994a43e", 200),
};

export const categoryImages: Record<string, string> = {
  cars: getCategoryFallbackUrl("cars"),
  "real-estate": getCategoryFallbackUrl("real-estate"),
  electronics: getCategoryFallbackUrl("electronics"),
  mobiles: getCategoryFallbackUrl("mobiles"),
  furniture: getCategoryFallbackUrl("furniture"),
  jobs: getCategoryFallbackUrl("jobs"),
  fashion: getCategoryFallbackUrl("fashion"),
  services: getCategoryFallbackUrl("services"),
  pets: getCategoryFallbackUrl("pets"),
  kids: getCategoryFallbackUrl("kids"),
  books: getCategoryFallbackUrl("books"),
  sports: getCategoryFallbackUrl("sports"),
  food: getCategoryFallbackUrl("food"),
};

export function imagesForSlug(slug: string): string[] {
  if (listingImages[slug]?.length) {
    return listingImages[slug];
  }

  const category = slugCategories[slug] ?? "default";
  return galleryFromPool(category, slug);
}

export function categoryForSlug(slug: string): ImageFallbackCategory {
  return slugCategories[slug] ?? "default";
}

export { getFallbackUrl, getCategoryFallbackUrl };
