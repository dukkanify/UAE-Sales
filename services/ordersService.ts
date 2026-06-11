export async function createOrderDraft(listingId: string) {
  return {
    listingId,
    status: "draft",
  };
}
