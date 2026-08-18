"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useImagePreviews } from "./useImagePreviews";
import { countries } from "@/shared/constants/locations";
import { isDynamicCategory } from "@/shared/constants/category-fields";
import type { Category, Listing } from "@/types";
import {
  getAccountGatePath,
  isMarketplaceAccountReady,
} from "@/services/auth/account-access";
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
      setListingImages(fileList, 12, mode);
    },
    [setListingImages],
  );
  const [preview, setPreview] = useState<ListingPreview>(defaultPreview);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id ?? "",
  );
  const [isAllowed] = useState(() => {
    if (typeof window === "undefined") return false;
    return isMarketplaceAccountReady(getSessionUser());
  });
  const [blockReason] = useState<"login" | "pending" | "blocked">(() => {
    if (typeof window === "undefined") return "login";
    const user = getSessionUser();
    if (!user) return "login";
    if (user.accountStatus === "pending") return "pending";
    return "blocked";
  });
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
      if (!user || !isMarketplaceAccountReady(user)) {
        router.replace(
          user ? getAccountGatePath(user) : "/login?next=/listings/new",
        );
        return;
      }

      const formData = new FormData(event.currentTarget);
      const categoryId = String(formData.get("categoryId") ?? selectedCategoryId);
      const contact = String(formData.get("contact") ?? "").trim();
      const subcategory = String(formData.get("subcategory") ?? "").trim();
      const videoUrl = String(formData.get("videoUrl") ?? "").trim();
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
      if (imageFiles.length === 0) {
        nextErrors.images = "أضف صورة حقيقية واحدة على الأقل للمنتج.";
      }
      if (!(parsed.emirate ?? "").trim()) {
        nextErrors.emirate = "اختر الإمارة.";
      }
      if (!parsed.city.trim()) {
        nextErrors.city = "اكتب المدينة أو المنطقة.";
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      publishedRef.current = true;

      const price = Number(formData.get("price") ?? 0);
      const description = String(formData.get("description") ?? "").trim();
      const persistedImages = await uploadListingImages(imageFiles);
      const cityName = parsed.city.trim();
      const emirateName = (parsed.emirate ?? "").trim() || cityName;

      const id = `local-${Date.now()}`;
      const postedAt = new Date().toISOString();
      const listingPackage = String(formData.get("package") ?? "free");
      const wantsFeatured = listingPackage === "featured_pending";
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
        status: wantsFeatured ? "draft" : "pending_review",
        isFeatured: false,
        featuredRequested: wantsFeatured || undefined,
        views: 0,
        imageUrl: persistedImages[0],
        images: persistedImages,
        seller: buildSellerFromSession(user),
        imageTone: "gold",
        postedAt,
        categorySpecs: isDynamicCategory(categoryId) ? parsed.categorySpecs : undefined,
        features: parsed.features.length > 0 ? parsed.features : undefined,
        negotiable: parsed.negotiable,
        emirate: emirateName,
        subcategory: subcategory || undefined,
        contactPhone: contact,
        contactMethod: "both",
        ...(videoUrl ? { videoUrl } : {}),
      };

      saveLocalListing(listing);

      let saved = listing;
      try {
        const response = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ listing }),
        });
        const data = await response.json();
        if (!response.ok || !data.listing) {
          publishedRef.current = false;
          setErrors({
            submit:
              data.message ??
              "تعذر حفظ الإعلان على الخادم. حاول مرة أخرى حتى يظهر في إعلاناتي.",
          });
          return;
        }
        saved = data.listing as Listing;
        saveLocalListing(saved);
      } catch {
        publishedRef.current = false;
        setErrors({
          submit: "تعذر حفظ الإعلان على الخادم. حاول مرة أخرى.",
        });
        return;
      }

      if (wantsFeatured) {
        try {
          const featureRes = await fetch(`/api/listings/${saved.id}/feature`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({}),
          });
          const featureData = await featureRes.json();
          if (featureRes.ok && featureData.checkoutUrl) {
            window.location.href = featureData.checkoutUrl as string;
            return;
          }
        } catch {
          // Keep the draft in My Ads with a complete-payment action.
        }
        router.push(`/dashboard/listings?featured=pay`);
        return;
      }

      router.push(`/dashboard/listings?submitted=1`);
    },
    [imageFiles, router, selectedCategoryId],
  );

  const { isLoading: isSubmitting, run: submitListing } =
    useAsyncAction(publishListing);

  useEffect(() => {
    if (isAllowed) return;
    const user = getSessionUser();
    router.replace(user ? getAccountGatePath(user) : "/login?next=/listings/new");
  }, [isAllowed, router]);

  return {
    blockReason,
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
