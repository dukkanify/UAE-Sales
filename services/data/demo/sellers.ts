import type { ListingSeller } from "@/types";
import { sellerAvatars } from "./images";

export type DemoSellerProfile = ListingSeller & {
  nameEnglish?: string;
};

export const demoSellers: Record<string, DemoSellerProfile> = {
  "al-noor-motors": {
    id: "seller-al-noor-motors",
    name: "معرض النور للسيارات",
    nameEnglish: "Al Noor Motors",
    rating: 4.9,
    avatarUrl: sellerAvatars.alNoorMotors,
    isVerified: true,
    sellerType: "business",
    joinedAt: "2021-03-15",
  },
  "dubai-elite-properties": {
    id: "seller-dubai-elite",
    name: "دبي إيليت للعقارات",
    nameEnglish: "Dubai Elite Properties",
    rating: 4.8,
    avatarUrl: sellerAvatars.dubaiElite,
    isVerified: true,
    sellerType: "business",
    joinedAt: "2019-08-22",
  },
  "gulf-electronics": {
    id: "seller-gulf-electronics",
    name: "إلكترونيات الخليج",
    nameEnglish: "Gulf Electronics",
    rating: 4.7,
    avatarUrl: sellerAvatars.gulfElectronics,
    isVerified: true,
    sellerType: "business",
    joinedAt: "2020-11-05",
  },
  "emirates-home-services": {
    id: "seller-emirates-home",
    name: "خدمات الإمارات المنزلية",
    nameEnglish: "Emirates Home Services",
    rating: 4.9,
    avatarUrl: sellerAvatars.emiratesHome,
    isVerified: true,
    sellerType: "business",
    joinedAt: "2018-06-10",
  },
  "golden-key-real-estate": {
    id: "seller-golden-key",
    name: "المفتاح الذهبي للعقارات",
    nameEnglish: "Golden Key Real Estate",
    rating: 4.8,
    avatarUrl: sellerAvatars.goldenKey,
    isVerified: true,
    sellerType: "business",
    joinedAt: "2017-02-18",
  },
  "khalid-al-mansoori": {
    id: "seller-khalid",
    name: "خالد المنصوري",
    nameEnglish: "Khalid Al Mansoori",
    rating: 4.8,
    avatarUrl: sellerAvatars.khalidAlMansoori,
    isVerified: true,
    sellerType: "individual",
    joinedAt: "2022-04-12",
  },
  "fatima-al-zaabi": {
    id: "seller-fatima",
    name: "فاطمة الزعابي",
    nameEnglish: "Fatima Al Zaabi",
    rating: 4.9,
    avatarUrl: sellerAvatars.fatimaAlZaabi,
    isVerified: true,
    sellerType: "individual",
    joinedAt: "2021-09-30",
  },
  "omar-hassan": {
    id: "seller-omar",
    name: "عمر حسن",
    nameEnglish: "Omar Hassan",
    rating: 4.6,
    avatarUrl: sellerAvatars.omarHassan,
    isVerified: false,
    sellerType: "individual",
    joinedAt: "2023-01-20",
  },
  "priya-sharma": {
    id: "seller-priya",
    name: "بريا شارما",
    nameEnglish: "Priya Sharma",
    rating: 4.7,
    avatarUrl: sellerAvatars.priyaSharma,
    isVerified: true,
    sellerType: "individual",
    joinedAt: "2022-07-08",
  },
  "ahmed-al-mansoori": {
    id: "user-current",
    name: "أحمد المنصوري",
    nameEnglish: "Ahmed Al Mansoori",
    rating: 4.8,
    avatarUrl: sellerAvatars.ahmedAlMansoori,
    isVerified: true,
    sellerType: "individual",
    joinedAt: "2026-01-15",
  },
};

export function resolveSeller(sellerKey: string): ListingSeller {
  const seller = demoSellers[sellerKey];
  if (!seller) {
    throw new Error(`Unknown demo seller: ${sellerKey}`);
  }
  return {
    id: seller.id,
    name: seller.name,
    rating: seller.rating,
    avatarUrl: seller.avatarUrl,
    isVerified: seller.isVerified,
    sellerType: seller.sellerType,
    joinedAt: seller.joinedAt,
  };
}
