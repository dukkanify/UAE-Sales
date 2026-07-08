"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cities, countries } from "@/shared/constants/locations";
import type { Category, Listing, ListingCondition } from "@/types";
import { getSessionUser, saveLocalListing } from "@/services/storage";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { persistImageFiles } from "@/shared/utils/persist-images";
import type { AddListingErrors, ListingPreview } from "./types";
import { createSlug } from "./utils";

const defaultPreview: ListingPreview = {
  city: "دبي",
  condition: "used",
  description: "سيظهر وصف الإعلان هنا أثناء الكتابة.",
  price: "2500",
  title: "عنوان إعلانك المميز",
};

export function useAddListingForm(categories: Category[]) {
  const router = useRouter();
  const [errors, setErrors] = useState<AddListingErrors>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
      const title = String(formData.get("title") ?? "").trim();
      const description = String(formData.get("description") ?? "").trim();
      const price = Number(formData.get("price") ?? 0);
      const categoryId = String(formData.get("categoryId") ?? selectedCategoryId);
      const condition = String(formData.get("condition") ?? "used") as ListingCondition;
      const cityId = String(formData.get("city") ?? "dubai");
      const contact = String(formData.get("contact") ?? "").trim();
      const nextErrors: AddListingErrors = {};

      if (!categoryId) {
        nextErrors.category = "اختر القسم المناسب للإعلان.";
      }
      if (title.length < 8) {
        nextErrors.title = "عنوان الإعلان يجب أن يكون 8 أحرف على الأقل.";
      }
      if (description.length < 20) {
        nextErrors.description = "اكتب وصفاً واضحاً لا يقل عن 20 حرفاً.";
      }
      if (!Number.isFinite(price) || price <= 0) {
        nextErrors.price = "اكتب سعراً صحيحاً أكبر من صفر.";
      }
      if (!/^(\+971|971|0)?5\d{8}$/.test(contact)) {
        nextErrors.contact = "اكتب رقم تواصل إماراتي صحيح.";
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      publishedRef.current = true;

      const persistedImages =
        imageFiles.length > 0 ? await persistImageFiles(imageFiles) : [];

      const id = `local-${Date.now()}`;
      const listing: Listing = {
        id,
        title,
        slug: createSlug(title) || id,
        description,
        categoryId,
        city: cities.find((city) => city.id === cityId)?.name ?? "دبي",
        country: countries[0].name,
        price,
        currency: "AED",
        condition,
        status: "active",
        isFeatured: false,
        views: 0,
        imageUrl: persistedImages[0],
        images: persistedImages.length > 0 ? persistedImages : undefined,
        seller: {
          id: user.id,
          name: user.fullName,
          rating: 4.8,
        },
        imageTone: "gold",
        postedAt: new Date().toISOString(),
      };

      saveLocalListing(listing);
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

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  function handleImageChange(fileList: FileList | null) {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    if (!fileList || fileList.length === 0) {
      setImageFiles([]);
      setImagePreviews([]);
      return;
    }

    const files = Array.from(fileList).slice(0, 6);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  }

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
