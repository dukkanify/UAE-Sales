import { z } from "zod";

export const buyerSessionSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(["user", "business", "admin"]).optional(),
});

export const listingSnapshotSchema = z.object({
  id: z.string().min(1),
  slug: z.string().optional(),
  title: z.string().min(1),
  price: z.number().positive(),
  seller: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
});

export const createCheckoutSchema = z.object({
  listingId: z.string().min(1),
  buyer: buyerSessionSchema,
  localListing: listingSnapshotSchema.optional(),
});

export const confirmOrderSchema = z.object({
  buyer: buyerSessionSchema,
});

export const refundOrderSchema = z.object({
  admin: buyerSessionSchema,
  reason: z.string().max(500).optional(),
});

export type BuyerSession = z.infer<typeof buyerSessionSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
