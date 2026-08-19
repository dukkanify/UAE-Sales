import { revalidatePath } from "next/cache";
import { getCategories } from "@/services/categories";

type CatalogListingRef = {
  categoryId?: string;
  slug?: string;
};

/**
 * Drop Next.js route cache for marketplace surfaces after a listing
 * is created, edited, approved, renewed, or featured.
 */
export async function revalidateCatalogSurfaces(listing?: CatalogListingRef) {
  try {
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/featured");
    revalidatePath("/categories");
    revalidatePath("/dashboard/listings");
    revalidatePath("/listings", "layout");
    revalidatePath("/categories", "layout");

    if (listing?.slug) {
      revalidatePath(`/listings/${listing.slug}`);
    }

    if (listing?.categoryId) {
      const categories = await getCategories();
      const category = categories.find((item) => item.id === listing.categoryId);
      if (category?.slug) {
        revalidatePath(`/categories/${category.slug}`);
      }
    }
  } catch {
    // Ignore when invoked outside a Next.js request (scripts/tests).
  }
}
