export function isStrongPassword(value: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value.trim());
}

export const STRONG_PASSWORD_HINT =
  "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل مع حرف كبير وصغير ورقم.";
