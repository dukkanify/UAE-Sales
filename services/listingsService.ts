import { mockListings } from "./mockData";

export async function getFeaturedListings() {
  return mockListings.filter((listing) => listing.isFeatured);
}
