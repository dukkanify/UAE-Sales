export const GENERIC_OTP_SENT_MESSAGE =
  "إذا كان البريد صالحًا، فسيتم إرسال رمز التحقق إليه.";

export const OTP_SEND_FAILED_MESSAGE =
  "تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى.";

export const OTP_VERIFY_MESSAGES = {
  INVALID: "رمز التحقق غير صحيح.",
  EXPIRED: "انتهت صلاحية الرمز. اطلب رمزًا جديدًا.",
  MAX_ATTEMPTS: "تجاوزت الحد المسموح من المحاولات. اطلب رمزًا جديدًا.",
  NOT_FOUND: "لم يتم العثور على طلب تحقق نشط.",
} as const;

export const RESEND_COOLDOWN_MESSAGE = "يرجى الانتظار قبل إعادة إرسال الرمز.";

export const SESSION_FAILED_MESSAGE =
  "تعذر إنشاء الجلسة. يرجى المحاولة مرة أخرى.";
