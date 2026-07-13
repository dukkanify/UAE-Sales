import {
  galleryFromPool,
  unsplashUrl,
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
  "macbook-pro-m3-14-inch": "mobiles",
  "sony-playstation-5": "electronics",
  "lg-oled-tv-65-inch": "electronics",
  "canon-eos-r6": "electronics",
  "bose-soundbar-900": "electronics",
  "apple-watch-ultra-2": "fashion",
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
  "rolex-submariner-date-dubai": "fashion",
  "louis-vuitton-neverfull-mm": "fashion",
  "designer-abaya-limited-edition": "fashion",
  "premium-arabic-oud-gift-set": "fashion",
  "golden-retriever-vaccinated-dubai": "pets",
  "persian-cat-sharjah": "pets",
  "marine-aquarium-complete-setup": "pets",
  "budgie-pair-umm-al-quwain": "pets",
  "bugaboo-fox-5-stroller": "kids",
  "lego-collector-sets-bundle": "kids",
  "nursery-furniture-complete-set": "kids",
  "school-uniform-bundle-gems": "kids",
  "arabic-novels-collection-20": "books",
  "ielts-academic-prep-bundle": "books",
  "university-textbooks-engineering": "books",
  "luxury-quran-gift-set": "books",
  "peloton-bike-plus-dubai": "sports",
  "callaway-golf-clubs-set": "sports",
  "desert-camping-gear-bundle": "sports",
  "home-gym-rack-weights": "sports",
  "fujairah-premium-dates-gift-box": "food",
  "emirati-home-catering-tray-20": "food",
  "ajman-natural-sidrah-honey": "food",
  "emirati-sweets-assorted-platter": "food",
  "my-nissan-patrol-platinum-2022": "cars",
  "my-iphone-15-pro-sale": "mobiles",
  "my-dining-table-draft": "furniture",
  "my-studio-jvc-rent": "real-estate",
  "my-apple-watch-rejected": "fashion",
};

/** Product-specific Unsplash photos for accurate marketplace previews */
const curatedPhotoIds: Record<string, readonly string[]> = {
  "mercedes-amg-g63-2024": [
    "photo-1618843479313-40f8afb4b4d8",
    "photo-1617531653332-bd46c24f2068",
    "photo-1544636331-e26879cd4d9b",
  ],
  "toyota-land-cruiser-2023": [
    "photo-1544636331-e26879cd4d9b",
    "photo-1552519507-da3b142c6e3d",
    "photo-1533473359331-0135ef1b58bf",
  ],
  "nissan-patrol-platinum-2022": [
    "photo-1552519507-da3b142c6e3d",
    "photo-1503376780353-7e6692767b70",
    "photo-1492144534655-ae79c964c9d7",
  ],
  "bmw-x7-2023": [
    "photo-1555215695-3004980ad54e",
    "photo-1617788138017-80ad40651399",
  ],
  "tesla-model-y-2024": [
    "photo-1560958089-b8a1929cea89",
    "photo-1619767886558-efdc259cde1a",
  ],
  "villa-palm-jumeirah": [
    "photo-1600585154340-be6161a56a0c",
    "photo-1600607687939-ce8a6c25118c",
    "photo-1600566753190-17f0baa2a6c3",
  ],
  "apartment-downtown-dubai": [
    "photo-1502672260266-1c1ef2d93688",
    "photo-1522708323590-d24dbb6b0267",
  ],
  "townhouse-arabian-ranches": [
    "photo-1600566753190-17f0baa2a6c3",
    "photo-1600585154340-be6161a56a0c",
  ],
  "office-business-bay": [
    "photo-1486406146926-c627a92ad1ab",
    "photo-1497366216548-37526070297c",
  ],
  "studio-jvc": [
    "photo-1522708323590-d24dbb6b0267",
    "photo-1505693416388-ac5ce068fe85",
  ],
  "iphone-16-pro-max-256gb": [
    "photo-1592750475338-74b7b21085ab",
    "photo-1511707171634-5f897ff02aa9",
  ],
  "samsung-galaxy-s25-ultra": [
    "photo-1556656793-08538906a9f8",
    "photo-1592750475338-74b7b21085ab",
  ],
  "iphone-15-pro-128gb": [
    "photo-1695048133142-1a20484d2569",
    "photo-1592750475338-74b7b21085ab",
  ],
  "ipad-pro-m4-13-inch": [
    "photo-1544244015-0df4b3ffc6b0",
    "photo-1561154464-82e9adf32764",
  ],
  "macbook-pro-m3-14-inch": [
    "photo-1517336714731-489689fd1ca8",
    "photo-1496181133206-80ce9b88a853",
  ],
  "sony-playstation-5": [
    "photo-1606813907291-d86efa9b94db",
    "photo-1622297845775-5ff3fef71d13",
  ],
  "lg-oled-tv-65-inch": [
    "photo-1593359677879-a4bb92f829d1",
    "photo-1461151304267-38535e780c79",
  ],
  "canon-eos-r6": [
    "photo-1502920917128-1aa500764cbd",
    "photo-1452587925148-ce544e77e70d",
  ],
  "apple-watch-ultra-2": [
    "photo-1579586337278-3befd40fd17a",
    "photo-1523275335684-37898b6baf30",
  ],
  "luxury-italian-sofa-set": [
    "photo-1555041469-a586c61ea9bc",
    "photo-1616486338812-3dadae4b4ace",
  ],
  "home-cleaning-service-dubai": [
    "photo-1581578731548-c64695cc6952",
    "photo-1628177142898-93e36e4e3a50",
  ],
  "car-detailing-premium": [
    "photo-1618843479313-40f8afb4b4d8",
    "photo-1486262715619-67b85e0b08d3",
  ],
  "golden-retriever-vaccinated-dubai": [
    "photo-1587300003388-59208cc962cb",
    "photo-1548199973-03cce0bbc87b",
  ],
  "persian-cat-sharjah": [
    "photo-1574158622682-e40e69881006",
    "photo-1514888286974-6c03e2ca1dba",
  ],
  "bugaboo-fox-5-stroller": [
    "photo-1516627145497-ae6968895b74",
    "photo-1502086223501-7ea6ecd79368",
  ],
  "peloton-bike-plus-dubai": [
    "photo-1461896836934-ffe607ba8211",
    "photo-1534438327276-14e5300c3a48",
  ],
  "fujairah-premium-dates-gift-box": [
    "photo-1504674900247-0877df9cc836",
    "photo-1488477181941-6428a0291777",
  ],
  "rolex-submariner-date-dubai": [
    "photo-1523170335258-f5ed11844a49",
    "photo-1579586337278-3befd40fd17a",
  ],
  "louis-vuitton-neverfull-mm": [
    "photo-1434389677669-e08b4cac3105",
    "photo-1523170335258-f5ed11844a49",
  ],
};

function photosFromIds(ids: readonly string[], width = 1200): string[] {
  return ids.map((photoId) => unsplashUrl(photoId, width));
}

function buildListingImages(): Record<string, string[]> {
  const images: Record<string, string[]> = {};

  for (const slug of Object.keys(slugCategories)) {
    const curated = curatedPhotoIds[slug];
    if (curated?.length) {
      images[slug] = photosFromIds(curated);
      continue;
    }

    const category = slugCategories[slug] ?? "default";
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
