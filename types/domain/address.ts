export type DeliveryAddress = {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  emirate: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  unit?: string;
  landmark?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShippingMethodId = "express" | "standard" | "pickup";

export type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  description: string;
  fee: number;
  estimatedLabel: string;
};
