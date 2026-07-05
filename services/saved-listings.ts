import { getCategoryFallbackUrl, unsplashUrl } from "@/shared/constants/image-fallbacks";

export async function getSavedListings() {
  return [
    {
      slug: "mercedes-amg-g63-2024",
      title: "مرسيدس-AMG G63 موديل 2024",
      price: 895000,
      imageUrl: unsplashUrl("photo-1618843479313-40f8afb4b4d8", 600),
    },
    {
      slug: "villa-palm-jumeirah",
      title: "فيلا فاخرة على نخلة جميرا",
      price: 18500000,
      imageUrl: getCategoryFallbackUrl("real-estate", 600),
    },
    {
      slug: "iphone-16-pro-max-256gb",
      title: "آيفون 16 برو ماكس 256 جيجابايت",
      price: 4899,
      imageUrl: getCategoryFallbackUrl("mobiles", 600),
    },
    {
      slug: "sony-playstation-5",
      title: "سوني بلايستيشن 5",
      price: 1899,
      imageUrl: getCategoryFallbackUrl("electronics", 600),
    },
  ];
}
