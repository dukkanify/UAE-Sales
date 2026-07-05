export type ImageFallbackCategory =
  | "avatar"
  | "books"
  | "cars"
  | "default"
  | "electronics"
  | "emirates"
  | "fashion"
  | "food"
  | "furniture"
  | "jobs"
  | "kids"
  | "mobiles"
  | "pets"
  | "real-estate"
  | "services"
  | "sports";

export type EmirateImageKey =
  | "abu-dhabi"
  | "ajman"
  | "dubai"
  | "fujairah"
  | "ras-al-khaimah"
  | "sharjah";

const q = "auto=format&fit=crop&w=1200&q=85";

export function unsplashUrl(photoId: string, width = 1200): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=85`;
}

/** Verified Unsplash photo IDs — HTTP 200 checked */
export const verifiedPhotoPools: Record<ImageFallbackCategory, readonly string[]> = {
  cars: [
    "photo-1618843479313-40f8afb4b4d8",
    "photo-1549317661-bd32c8ce0db2",
    "photo-1552519507-da3b142c6e3d",
    "photo-1503376780353-7e6692767b70",
    "photo-1492144534655-ae79c964c9d7",
    "photo-1544636331-e26879cd4d9b",
    "photo-1533473359331-0135ef1b58bf",
    "photo-1486262715619-67b85e0b08d3",
    "photo-1502877338535-766e1452684a",
    "photo-1555215695-3004980ad54e",
    "photo-1617531653332-bd46c24f2068",
    "photo-1560958089-b8a1929cea89",
    "photo-1536700503339-1e4b06520771",
    "photo-1617788138017-80ad40651399",
    "photo-1619767886558-efdc259cde1a",
  ],
  "real-estate": [
    "photo-1600585154340-be6161a56a0c",
    "photo-1600607687939-ce8a6c25118c",
    "photo-1600566753190-17f0baa2a6c3",
    "photo-1502672260266-1c1ef2d93688",
    "photo-1522708323590-d24dbb6b0267",
    "photo-1505693416388-ac5ce068fe85",
    "photo-1631049307264-da0ec9d70304",
    "photo-1616594039964-ae9021a400a0",
    "photo-1486406146926-c627a92ad1ab",
    "photo-1497366216548-37526070297c",
    "photo-1497366811353-6870744d04b2",
    "photo-1524758631624-e2822e304c36",
    "photo-1497366754035-f200968a6e72",
  ],
  mobiles: [
    "photo-1695048133142-1a20484d2569",
    "photo-1592750475338-74b7b21085ab",
    "photo-1511707171634-5f897ff02aa9",
    "photo-1585060544812-6b45742d762f",
    "photo-1592899677977-9c10ca588bbd",
    "photo-1556656793-08538906a9f8",
    "photo-1544244015-0df4b3ffc6b0",
    "photo-1561154464-82e9adf32764",
    "photo-1434493789847-2f02dc6ca35d",
    "photo-1546868871-7041f2a55e12",
  ],
  electronics: [
    "photo-1606813907291-d86efa9b94db",
    "photo-1496181133206-80ce9b88a853",
    "photo-1517336714731-489689fd1ca8",
    "photo-1622297845775-5ff3fef71d13",
    "photo-1493711662062-fa541adb3fc8",
    "photo-1621259182978-fbf93132d53d",
    "photo-1593359677879-a4bb92f829d1",
    "photo-1461151304267-38535e780c79",
    "photo-1558618666-fcd25c85cd64",
    "photo-1484704849700-f032a568e944",
    "photo-1516035069371-29a1b244cc32",
    "photo-1502920917128-1aa500764cbd",
    "photo-1452587925148-ce544e77e70d",
  ],
  furniture: [
    "photo-1555041469-a586c61ea9bc",
    "photo-1616486338812-3dadae4b4ace",
    "photo-1493663284031-b7e3aefcae8e",
    "photo-1586023492125-27b2c045efd7",
    "photo-1615529328331-f8917597711f",
    "photo-1600047509358-9dc75507daeb",
  ],
  services: [
    "photo-1581578731548-c64695cc6952",
    "photo-1628177142898-93e36e4e3a50",
    "photo-1503387762-592deb58ef4e",
    "photo-1504307651254-35680f356dfd",
    "photo-1621905251189-08b45d6a269e",
    "photo-1600518464441-9154a4dea21b",
    "photo-1600880292203-757bb62b4baf",
    "photo-1586528116311-ad8dd3c8310d",
    "photo-1566576912321-d58ddd7a6088",
  ],
  jobs: [
    "photo-1556761175-b413da4baf72",
    "photo-1521737711867-e3b97375f902",
    "photo-1600880292089-90a7e086ee0c",
    "photo-1560472354-b33ff0c44a43",
    "photo-1556761175-5973dc0f32e7",
    "photo-1554224155-6726b3ff858f",
    "photo-1454165804606-c3d57bc86b40",
    "photo-1561070791-2526d30994b5",
    "photo-1586281380349-632531db7ed4",
  ],
  fashion: [
    "photo-1523170335258-f5ed11844a49",
    "photo-1434389677669-e08b4cac3105",
    "photo-1579586337278-3befd40fd17a",
    "photo-1523275335684-37898b6baf30",
  ],
  kids: [
    "photo-1544776193-352d25ca82cd",
    "photo-1516627145497-ae6968895b74",
    "photo-1502086223501-7ea6ecd79368",
    "photo-1544776193-352d25ca82cd",
    "photo-1516627145497-ae6968895b74",
    "photo-1502086223501-7ea6ecd79368",
  ],
  pets: ["photo-1574158622682-e40e69881006"],
  books: ["photo-1495446815901-a7297e633e8d"],
  sports: ["photo-1461896836934-ffe607ba8211"],
  food: ["photo-1504674900247-0877df9cc836"],
  avatar: [
    "photo-1507003211169-0a1dd7228f2d",
    "photo-1494790108377-be9c29b29330",
    "photo-1472099645785-5658abf4ff4e",
    "photo-1500648767791-00dcc994a43e",
  ],
  emirates: [
    "photo-1512453979798-5ea266f8880c",
    "photo-1518684079-3c830dcef090",
  ],
  default: [
    "photo-1512453979798-5ea266f8880c",
    "photo-1618843479313-40f8afb4b4d8",
    "photo-1600607687939-ce8a6c25118c",
  ],
};

export const emiratePhotoIds: Record<EmirateImageKey, string> = {
  dubai: "photo-1512453979798-5ea266f8880c",
  "abu-dhabi": "photo-1577717903315-1691ae25ab3f",
  sharjah: "photo-1506905925346-21bda4d32df4",
  ajman: "photo-1507525428034-b723cf961d3e",
  "ras-al-khaimah": "photo-1464822759023-fed622ff2c3b",
  fujairah: "photo-1520250497591-112f2f40a3f4",
};

export function getEmirateImageUrl(emirateId: string, width = 2000): string {
  const key = emirateId as EmirateImageKey;
  const photoId = emiratePhotoIds[key] ?? emiratePhotoIds.dubai;
  return unsplashUrl(photoId, width);
}

export function resolveFallbackCategory(
  categoryId?: string,
): ImageFallbackCategory {
  if (!categoryId) return "default";
  if (categoryId in verifiedPhotoPools) {
    return categoryId as ImageFallbackCategory;
  }
  return "default";
}

export function getCategoryFallbackUrl(
  categoryId?: string,
  width = 1200,
): string {
  const key = resolveFallbackCategory(categoryId);
  const pool = verifiedPhotoPools[key];
  return unsplashUrl(pool[0], width);
}

export function getFallbackUrl(
  category: ImageFallbackCategory = "default",
  width = 1200,
): string {
  const pool = verifiedPhotoPools[category] ?? verifiedPhotoPools.default;
  return unsplashUrl(pool[0], width);
}

export function galleryFromPool(
  category: ImageFallbackCategory,
  seed: string,
  count = 6,
  width = 1200,
): string[] {
  const pool = verifiedPhotoPools[category] ?? verifiedPhotoPools.default;
  let offset = 0;
  for (let i = 0; i < seed.length; i += 1) {
    offset = (offset + seed.charCodeAt(i) * (i + 1)) % pool.length;
  }

  const urls: string[] = [];
  for (let i = 0; i < pool.length && urls.length < count; i += 1) {
    const photoId = pool[(offset + i) % pool.length];
    const url = unsplashUrl(photoId, width);
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls;
}

export const heroBackgroundUrl = `https://images.unsplash.com/photo-1512453979798-5ea266f8880c?${q}`;

/** Verified seller portrait URLs */
export const sellerAvatarUrls = {
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
} as const;

export function getAllCategoryImageUrls(): Record<string, string> {
  const keys: ImageFallbackCategory[] = [
    "cars",
    "real-estate",
    "electronics",
    "mobiles",
    "furniture",
    "jobs",
    "fashion",
    "services",
    "pets",
    "kids",
    "books",
    "sports",
    "food",
  ];
  return Object.fromEntries(keys.map((key) => [key, getCategoryFallbackUrl(key)]));
}
