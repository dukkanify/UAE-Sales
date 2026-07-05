import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
  accountType: z.enum(["individual", "business", "buyer", "seller", "company"]),
  city: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(3),
  code: z.string().length(6),
});

export const listingSearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  city: z.string().optional(),
  emirate: z.string().optional(),
  area: z.string().optional(),
  condition: z.enum(["new", "used", "excellent"]).optional(),
  country: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  featured: z.coerce.boolean().optional(),
  premium: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
});

export const createListingSchema = z.object({
  categoryId: z.string(),
  titleArabic: z.string().min(3),
  titleEnglish: z.string().optional(),
  slug: z.string().min(3),
  descriptionArabic: z.string().min(10),
  descriptionEnglish: z.string().optional(),
  price: z.number().positive(),
  emirate: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  condition: z.enum(["new", "used", "excellent"]),
  status: z
    .enum(["draft", "active", "pending_review", "expired", "rejected"])
    .optional(),
  featured: z.boolean().optional(),
  premium: z.boolean().optional(),
  escrowAvailable: z.boolean().optional(),
  images: z.array(z.string().url()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  city: z.string().optional(),
  emirate: z.string().optional(),
});

export const createOrderSchema = z.object({
  listingId: z.string(),
  amount: z.number().positive(),
  paymentFee: z.number().nonnegative().optional(),
  platformFee: z.number().nonnegative().optional(),
});

export const createDisputeSchema = z.object({
  orderId: z.string(),
  reason: z.enum([
    "not_received",
    "not_as_described",
    "damaged",
    "wrong_item",
    "seller_unresponsive",
    "other",
  ]),
  description: z.string().min(10),
  preferredResolution: z.enum([
    "full_refund",
    "partial_refund",
    "replacement",
    "release_to_seller",
  ]),
  evidenceNote: z.string().optional(),
});

export const escrowActionSchema = z.object({
  orderId: z.string(),
});

export const sendChatMessageSchema = z.object({
  text: z.string().trim().max(4000).optional(),
  imageUrl: z.string().url().optional(),
}).refine((value) => Boolean(value.text?.length) || Boolean(value.imageUrl), {
  message: "نص الرسالة أو صورة مرفقة مطلوبة.",
});

export const favoriteSchema = z.object({
  listingId: z.string().min(1),
});

export const adminUserPatchSchema = z.object({
  verified: z.boolean().optional(),
  suspended: z.boolean().optional(),
});

export const adminListingPatchSchema = z.object({
  status: z
    .enum(["draft", "active", "pending_review", "expired", "rejected"])
    .optional(),
  featured: z.boolean().optional(),
  premium: z.boolean().optional(),
});

export const adminDisputePatchSchema = z.object({
  status: z.enum(["open", "under_review", "resolved", "closed"]).optional(),
  decision: z.enum(["refund_buyer", "release_seller", "partial_refund"]).optional(),
});

export const adminEscrowActionSchema = z.object({
  action: z.enum(["release", "refund"]),
});

export const adminCategoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export const adminCategoryPatchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  disabled: z.boolean().optional(),
});

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<T> {
  const body = (await request.json()) as unknown;
  const result = schema.safeParse(body);

  if (!result.success) {
    const { ApiHttpError } = await import("@/lib/api/response");
    throw new ApiHttpError(
      400,
      "VALIDATION_ERROR",
      result.error.issues[0]?.message ?? "بيانات غير صالحة.",
    );
  }

  return result.data;
}
