export type CheckoutLiveLocationValue = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  emirate: string;
  city: string;
  area: string;
};

export const CHECKOUT_LIVE_LOCATION_COPY = {
  ar: {
    useMyLocation: "استخدام موقعي الحالي",
    locating: "جاري تحديد موقعك…",
    detected: "تم تحديد موقع التوصيل",
    editLocation: "تعديل الموقع",
    useThisLocation: "استخدام هذا الموقع",
    dragHint: "اسحب الخريطة لتحريك الدبوس وتصحيح الموقع.",
    privacyHint: "يُستخدم الموقع المباشر للتوصيل فقط. لا نتتبّع موقعك في الخلفية.",
    denied: "تم رفض إذن الموقع. يمكنك كتابة العنوان يدويًا.",
    unavailable: "تعذر تحديد الموقع. يمكنك كتابة العنوان يدويًا.",
    unsupported: "المتصفح لا يدعم تحديد الموقع. اكتب العنوان يدويًا.",
    outsideUae: "يبدو أن الموقع خارج الإمارات. حرّك الدبوس أو اكتب العنوان يدويًا.",
    geocodeFailed: "ظهر موقعك على الخريطة، لكن تعذر قراءة العنوان. حرّك الدبوس أو أكمل الكتابة يدويًا.",
    applied: "سيتم إرسال هذه الإحداثيات لشركة التوصيل عند تأكيد الشراء.",
  },
  en: {
    useMyLocation: "Use my current location",
    locating: "Detecting your location…",
    detected: "Delivery location set",
    editLocation: "Edit location",
    useThisLocation: "Use this location",
    dragHint: "Drag the map to move the pin and correct the location.",
    privacyHint: "Live location is used only for delivery. We do not track you in the background.",
    denied: "Location access was denied. You can type the address instead.",
    unavailable: "Could not detect your location. You can type the address instead.",
    unsupported: "This browser does not support location. Type the address instead.",
    outsideUae: "This location appears to be outside the UAE. Move the pin or type the address.",
    geocodeFailed: "Your pin is on the map, but the address could not be read. Move the pin or type it.",
    applied: "These coordinates are sent to the courier only when you confirm the purchase.",
  },
} as const;
