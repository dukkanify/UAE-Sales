import { sellerAvatarUrls } from "@/shared/constants/image-fallbacks";

export async function getChatThreads() {
  return [
    {
      id: "thread-001",
      listingTitle: "نيسان باترول بلاتينيوم 2022",
      participantName: "خالد المنصوري",
      lastMessage: "متى يمكنني معاينة السيارة في ياس؟",
      lastMessageAt: "2026-07-04T16:20:00+04:00",
      unreadCount: 2,
      avatarUrl: sellerAvatarUrls.khalidAlMansoori,
    },
    {
      id: "thread-002",
      listingTitle: "آيفون 15 برو 128 جيجابايت",
      participantName: "إلكترونيات الخليج",
      lastMessage: "الجهاز متوفر، يمكن التسليم اليوم في المجاز.",
      lastMessageAt: "2026-07-04T11:05:00+04:00",
      unreadCount: 0,
      avatarUrl: sellerAvatarUrls.gulfElectronics,
    },
    {
      id: "thread-003",
      listingTitle: "فيلا نخلة جميرا",
      participantName: "دبي إيليت للعقارات",
      lastMessage: "أرسلت لك جدول المعاينة ليوم السبت.",
      lastMessageAt: "2026-07-03T18:40:00+04:00",
      unreadCount: 1,
      avatarUrl: sellerAvatarUrls.dubaiElite,
    },
  ];
}
