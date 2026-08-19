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

export const EMAIL_ALREADY_REGISTERED_MESSAGE =
  "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل. يمكنك تسجيل الدخول.";

export const INVALID_CREDENTIALS_MESSAGE = "بيانات الدخول غير صحيحة.";

export const PASSWORD_RESET_GENERIC_MESSAGE =
  "إذا كان هناك حساب بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة تعيين كلمة المرور.";

export const PASSWORD_RESET_EXPIRED_MESSAGE =
  "انتهت صلاحية رابط إعادة تعيين كلمة المرور. يرجى طلب رابط جديد.";

export const PASSWORD_RESET_INVALID_MESSAGE = "رابط إعادة تعيين كلمة المرور غير صالح.";

export const PASSWORD_RESET_SUCCESS_MESSAGE =
  "تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.";
