"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useImagePreviews } from "./useImagePreviews";
import { cities, countries } from "@/shared/constants/locations";
import { isDynamicCategory } from "@/shared/constants/category-fields";
import type { Category, Listing } from "@/types";
import { getSessionUser, saveLocalListing } from "@/services/storage";
import { uploadListingImages } from "@/services/upload";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import type { AddListingErrors, ListingPreview } from "./types";
import { parseCategoryForm } from "./category-form-utils";
import { createSlug } from "./utils";

const defaultPreview: ListingPreview = {
  city: "دبي",
  condition: "used",
  description: "",
  price: "",
  title: "",
};

function buildSellerFromSession(user: NonNullable<ReturnType<typeof getSessionUser>>) {
  const sellerType =
    user.accountType === "company" || user.accountType === "business"
      ? ("business" as const)
      : ("individual" as const);

  return {
    id: user.id,
    name: user.fullName,
    ...(user.isVerified ? { isVerified: true } : {}),
    sellerType,
    ...(user.joinedAt ? { joinedAt: user.joinedAt } : {}),
  };
}

export function useAddListingForm(categories: Category[]) {
  const router = useRouter();
  const [errors, setErrors] = useState<AddListingErrors & Record<string, string | undefined>>({});
  const { handleImageChange: setListingImages, imageFiles, imagePreviews } =
    useImagePreviews();

  const handleImageChange = useCallback(
    (fileList: FileList | null, mode: "append" | "replace" = "replace") => {
      setListingImages(fileList, 6, mode);
    },
    [setListingImages],
  );
  const [preview, setPreview] = useState<ListingPreview>(defaultPreview);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id ?? "",
  );
  const [isAllowed] = useState(
    () => typeof window !== "undefined" && Boolean(getSessionUser()),
  );
  const publishedRef = useRef(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const publishListing = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (publishedRef.current) {
        return;
      }

      const user = getSessionUser();
      if (!user) {
        router.replace("/login?next=/listings/new");
        return;
      }

      const formData = new FormData(event.currentTarget);
      const categoryId = String(formData.get("categoryId") ?? selectedCategoryId);
      const contact = String(formData.get("contact") ?? "").trim();
      const subcategory = String(formData.get("subcategory") ?? "").trim();
      const parsed = parseCategoryForm(formData, categoryId);
      const nextErrors: AddListingErrors & Record<string, string | undefined> = {
        ...parsed.errors,
      };

      if (!categoryId) {
        nextErrors.category = "اختر القسم المناسب للإعلان.";
      }
      if (!/^(\+971|971|0)?5\d{8}$/.test(contact)) {
        nextErrors.contact = "اكتب رقم تواصل إماراتي صحيح.";
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      publishedRef.current = true;

      const price = Number(formData.get("price") ?? 0);
      const description = String(formData.get("description") ?? "").trim();
      const persistedImages =
        imageFiles.length > 0 ? await uploadListingImages(imageFiles) : [];

      const cityName = isDynamicCategory(categoryId)
        ? parsed.city
        : cities.find((city) => city.id === parsed.city)?.name ?? "دبي";

      const id = `local-${Date.now()}`;
      const listing: Listing = {
        id,
        title: isDynamicCategory(categoryId)
          ? parsed.title
          : String(formData.get("title") ?? "").trim(),
        slug: createSlug(
          isDynamicCategory(categoryId)
            ? parsed.title
            : String(formData.get("title") ?? "").trim(),
        ) || id,
        description,
        categoryId,
        city: cityName,
        country: countries[0].name,
        price,
        currency: "AED",
        condition: parsed.condition,
        status: "active",
        isFeatured: false,
        views: 0,
        imageUrl: persistedImages[0],
        images: persistedImages.length > 0 ? persistedImages : undefined,
        seller: buildSellerFromSession(user),
        imageTone: "gold",
        postedAt: new Date().toISOString(),
        categorySpecs: isDynamicCategory(categoryId) ? parsed.categorySpecs : undefined,
        features: parsed.features.length > 0 ? parsed.features : undefined,
        negotiable: parsed.negotiable,
        emirate: parsed.emirate,
        subcategory: subcategory || undefined,
        contactPhone: contact,
        contactMethod: "both",
      };

      saveLocalListing(listing);
      void fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing }),
      }).catch(() => undefined);
      router.push(`/listings/local/${id}`);
    },
    [imageFiles, router, selectedCategoryId],
  );

  const { isLoading: isSubmitting, run: submitListing } =
    useAsyncAction(publishListing);

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/login?next=/listings/new");
    }
  }, [isAllowed, router]);

  return {
    errors,
    handleImageChange,
    imagePreviews,
    isAllowed,
    isSubmitting,
    preview,
    selectedCategory,
    selectedCategoryId,
    setPreview,
    setSelectedCategoryId,
    submitListing,
  };
}
