"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useImagePreviews } from "./add-listing/useImagePreviews";
import { cities, countries } from "@/shared/constants/locations";
import { isDynamicCategory } from "@/shared/constants/category-fields";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import type { Listing } from "@/types";
import { getLocalListingById, saveLocalListing } from "@/services/storage";
import { uploadListingImages } from "@/services/upload";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import type { CategoryFieldErrors } from "./add-listing/CategoryFieldsForm";
import { parseCategoryForm } from "./add-listing/category-form-utils";
import { createSlug } from "./add-listing/utils";
import {
  buildCategoryFieldsDefaults,
  getListingImages,
} from "./listing-edit.utils";

function readListing(listingId: string): Listing | null {
  if (typeof window === "undefined") {
    return null;
  }
  return getLocalListingById(listingId) ?? null;
}

export function useEditListingForm(listingId: string) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(() => readListing(listingId));
  const [errors, setErrors] = useState<CategoryFieldErrors>({});
  const { handleImageChange: setImagePreviewsFromFiles, imageFiles, imagePreviews } =
    useImagePreviews();
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const sync = () => setListing(readListing(listingId));
    window.addEventListener(STORAGE_EVENTS.listingsChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.listingsChange, sync);
  }, [listingId]);

  const saveChanges = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const currentListing = readListing(listingId);
      if (!currentListing) {
        return;
      }

      const formData = new FormData(event.currentTarget);
      const categoryId = currentListing.categoryId;
      const contact = String(formData.get("contact") ?? "").trim();
      const parsed = parseCategoryForm(formData, categoryId);
      const nextErrors: CategoryFieldErrors = { ...parsed.errors };

      if (!/^(\+971|971|0)?5\d{8}$/.test(contact)) {
        nextErrors.contact = "اكتب رقم تواصل إماراتي صحيح.";
      }

      setErrors(nextErrors);
      setSaveMessage("");

      if (Object.keys(nextErrors).length > 0) {
        setSaveMessage("تأكد من صحة الحقول قبل الحفظ.");
        return;
      }

      const price = Number(formData.get("price") ?? 0);
      const description = String(formData.get("description") ?? "").trim();
      const existingImages = getListingImages(currentListing);
      const newImages =
        imageFiles.length > 0 ? await uploadListingImages(imageFiles) : [];
      const mergedImages = [...existingImages, ...newImages].slice(0, 6);

      const cityName = isDynamicCategory(categoryId)
        ? parsed.city
        : cities.find((city) => city.id === parsed.city)?.name ?? currentListing.city;

      const title = isDynamicCategory(categoryId)
        ? parsed.title
        : String(formData.get("title") ?? "").trim();

      const updatedListing: Listing = {
        ...currentListing,
        title,
        slug: createSlug(title) || currentListing.slug,
        description,
        price,
        condition: parsed.condition,
        city: cityName,
        country: countries[0].name,
        imageUrl: mergedImages[0],
        images: mergedImages.length > 0 ? mergedImages : undefined,
        categorySpecs: isDynamicCategory(categoryId) ? parsed.categorySpecs : undefined,
        features: parsed.features.length > 0 ? parsed.features : undefined,
        negotiable: parsed.negotiable,
        emirate: parsed.emirate,
        contactPhone: contact,
        contactMethod: "both",
      };

      saveLocalListing(updatedListing);
      setSaveMessage("تم حفظ التعديلات بنجاح.");
      router.push(`/listings/local/${currentListing.id}`);
    },
    [imageFiles, listingId, router],
  );

  const { isLoading, run: handleSubmit } = useAsyncAction(saveChanges);

  const handleImageChange = useCallback(
    (fileList: FileList | null, mode: "append" | "replace" = "replace") => {
      const current = readListing(listingId);
      const existingCount = current ? getListingImages(current).length : 0;
      const maxNew = Math.max(0, 6 - existingCount);
      setImagePreviewsFromFiles(fileList, maxNew, mode);
    },
    [listingId, setImagePreviewsFromFiles],
  );

  return {
    defaults: listing ? buildCategoryFieldsDefaults(listing) : undefined,
    errors,
    existingImages: listing ? getListingImages(listing) : [],
    handleImageChange,
    handleSubmit,
    imagePreviews,
    isDynamic: listing ? isDynamicCategory(listing.categoryId) : false,
    isLoading,
    listing,
    saveMessage,
  };
}
