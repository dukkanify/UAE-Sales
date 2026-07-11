import type { DeliveryAddress } from "@/types/domain/address";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const ADDRESSES_FILE = "addresses.json";

export async function getAddressesForUser(userId: string): Promise<DeliveryAddress[]> {
  const all = await loadCollection<DeliveryAddress>(ADDRESSES_FILE);
  return all.filter((item) => item.userId === userId);
}

export async function createAddress(
  input: Omit<DeliveryAddress, "id" | "createdAt" | "updatedAt">,
): Promise<DeliveryAddress> {
  const all = await loadCollection<DeliveryAddress>(ADDRESSES_FILE);
  const now = new Date().toISOString();
  const address: DeliveryAddress = {
    ...input,
    id: `addr-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  if (address.isDefault) {
    for (const item of all) {
      if (item.userId === address.userId) item.isDefault = false;
    }
  }

  all.unshift(address);
  await saveCollection(ADDRESSES_FILE, all);
  return address;
}

export async function updateAddress(
  addressId: string,
  userId: string,
  patch: Partial<DeliveryAddress>,
): Promise<DeliveryAddress | undefined> {
  const all = await loadCollection<DeliveryAddress>(ADDRESSES_FILE);
  const index = all.findIndex((item) => item.id === addressId && item.userId === userId);
  if (index === -1) return undefined;
  all[index] = { ...all[index], ...patch, updatedAt: new Date().toISOString() };
  await saveCollection(ADDRESSES_FILE, all);
  return all[index];
}

export async function deleteAddress(addressId: string, userId: string): Promise<boolean> {
  const all = await loadCollection<DeliveryAddress>(ADDRESSES_FILE);
  const next = all.filter((item) => !(item.id === addressId && item.userId === userId));
  if (next.length === all.length) return false;
  await saveCollection(ADDRESSES_FILE, next);
  return true;
}

export async function setDefaultAddress(
  addressId: string,
  userId: string,
): Promise<DeliveryAddress | undefined> {
  const all = await loadCollection<DeliveryAddress>(ADDRESSES_FILE);
  let updated: DeliveryAddress | undefined;
  for (const item of all) {
    if (item.userId === userId) {
      item.isDefault = item.id === addressId;
      if (item.id === addressId) updated = item;
    }
  }
  await saveCollection(ADDRESSES_FILE, all);
  return updated;
}
