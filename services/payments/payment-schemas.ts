import { z } from "zod";

export const buyerSessionSchema = z.object({
  id: z.string().min(1).optional(),
  email: z.string().email(),
  fullName: z.string().min(1),
  phone: z.string().min(8).optional(),
  role: z.enum(["user", "business", "admin"]).optional(),
});

export const deliveryAddressInputSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1).optional(),
  phone: z.string().min(8).optional(),
  emirate: z.string().min(1),
  city: z.string().min(1),
  area: z.string().min(1),
  street: z.string().min(1),
  building: z.string().optional(),
  unit: z.string().optional(),
  landmark: z.string().optional(),
  notes: z.string().optional(),
  companyName: z.string().optional(),
  saveAddress: z.boolean().optional(),
});

export const listingSnapshotSchema = z.object({
  id: z.string().min(1),
  slug: z.string().optional(),
  title: z.string().min(1),
  price: z.number().positive(),
  categoryId: z.string().optional(),
  emirate: z.string().optional(),
  city: z.string().optional(),
  seller: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
});

export const createCheckoutSchema = z.object({
  listingId: z.string().min(1),
  buyer: buyerSessionSchema,
  localListing: listingSnapshotSchema.optional(),
  shippingMethod: z.enum(["express", "standard", "pickup"]).optional(),
  shippingFee: z.number().min(0).optional(),
  addressId: z.string().optional(),
  deliveryAddress: deliveryAddressInputSchema.optional(),
  isGuest: z.boolean().optional(),
  forceMock: z.boolean().optional(),
});

export const confirmOrderSchema = z.object({
  buyer: buyerSessionSchema.extend({ id: z.string().min(1) }),
});

export const refundOrderSchema = z.object({
  admin: buyerSessionSchema.extend({ id: z.string().min(1) }),
  reason: z.string().max(500).optional(),
});

export type BuyerSession = z.infer<typeof buyerSessionSchema>;
export type DeliveryAddressInput = z.infer<typeof deliveryAddressInputSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
