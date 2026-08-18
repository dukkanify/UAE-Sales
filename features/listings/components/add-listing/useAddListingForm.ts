"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ADD_LISTING_IMAGE_CAP, useImagePreviews } from "./useImagePreviews";
import { cities, countries } from "@/shared/constants/locations";
import { isDynamicCategory } from "@/shared/constants/category-fields";
import type { Category, Listing } from "@/types";
import { getSessionUser, saveLocalListing } from "@/services/storage";
import { uploadListingImages } from "@/services/upload";
import { persistVideoFile } from "@/shared/utils/persist-video";
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

function featuredCheckoutError(code: string): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "سجّل الدخول من جديد لإتمام دفع الباقة المميزة.";
    case "LISTING_NOT_FOUND":
      return "تعذر حفظ الإعلان قبل الدفع. أعد المحاولة.";
    case "STRIPE_NOT_CONFIGURED":
      return "بوابة الدفع غير مفعّلة حالياً. تواصل مع الدعم.";
    case "ALREADY_FEATURED":
      return "هذا الإعلان مميز بالفعل.";
    default:
      return "تعذر فتح صفحة الدفع. أعد المحاولة.";
  }
}

async function syncListingToCatalog(
  listing: Listing,
): Promise<{ ok: boolean; error?: string }> {
  const post = async (payload: Listing) => {
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing: payload }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    return { ok: response.ok, error: data.error };
  };

  try {
    let result = await post(listing);
    if (!result.ok && (listing.images?.length ?? 0) > 1) {
      result = await post({
        ...listing,
        images: listing.images?.slice(0, 2),
        videoUrl: listing.videoUrl?.startsWith("data:") ? undefined : listing.videoUrl,
      });
    }
    return result;
  } catch {
    return { ok: false, error: "SAVE_FAILED" };
  }
}

export function useAddListingForm(categories: Category[]) {
  const router = useRouter();
  const [errors, setErrors] = useState<AddListingErrors & Record<string, string | undefined>>({});
  const {
    handleImageChange: setListingImages,
    imageFiles,
    imagePreviews,
    removeImage,
    setCoverIndex,
  } = useImagePreviews();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");

  const handleImageChange = useCallback(
    (fileList: FileList | null, mode: "append" | "replace" = "replace") => {
      setListingImages(fileList, ADD_LISTING_IMAGE_CAP, mode);
    },
    [setListingImages],
  );

  const handleVideoFileChange = useCallback((file: File | null) => {
    setVideoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : "";
    });
    setVideoFile(file);
  }, []);

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

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      publishedRef.current = true;

      let persistedVideo = videoUrl;
      if (videoFile) {
        try {
          persistedVideo = await persistVideoFile(videoFile);
        } catch {
          publishedRef.current = false;
          setErrors({
            video: "الفيديو أكبر من 12 ميغابايت. استخدم رابط يوتيوب أو ملفاً أصغر.",
          });
          return;
        }
      }

      const price = Number(formData.get("price") ?? 0);
      const description = String(formData.get("description") ?? "").trim();
      const persistedImages = await uploadListingImages(imageFiles);

      const cityName = isDynamicCategory(categoryId)
        ? parsed.city || "دبي"
        : cities.find((city) => city.id === parsed.city)?.name ?? "دبي";

      const id = `local-${Date.now()}`;
      const postedAt = new Date().toISOString();
      const listingPackage = String(formData.get("package") ?? "free");
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
        status: "pending_review",
        isFeatured: false,
        views: 0,
        imageUrl: persistedImages[0],
        images: persistedImages,
        seller: buildSellerFromSession(user),
        imageTone: "gold",
        postedAt,
        categorySpecs: isDynamicCategory(categoryId) ? parsed.categorySpecs : undefined,
        features: parsed.features.length > 0 ? parsed.features : undefined,
        negotiable: parsed.negotiable,
        emirate: parsed.emirate,
        subcategory: subcategory || undefined,
        contactPhone: contact,
        contactMethod: "both",
        ...(persistedVideo ? { videoUrl: persistedVideo } : {}),
      };

      saveLocalListing(listing);
      await syncListingToCatalog(listing);

      if (listingPackage === "featured_pending") {
        try {
          const featureRes = await fetch(`/api/listings/${id}/feature`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listing }),
          });
          const featureData = (await featureRes.json().catch(() => ({}))) as {
            checkoutUrl?: string;
            listing?: Listing;
            error?: string;
          };
          if (featureRes.ok && featureData.checkoutUrl) {
            window.location.href = featureData.checkoutUrl;
            return;
          }
          if (featureRes.ok && featureData.listing) {
            saveLocalListing(featureData.listing);
            router.push(`/listings/local/${id}?featured=mock`);
            return;
          }
          publishedRef.current = false;
          setErrors({
            package: featuredCheckoutError(featureData.error ?? "UNKNOWN_ERROR"),
          });
          return;
        } catch {
          publishedRef.current = false;
          setErrors({
            package: featuredCheckoutError("UNKNOWN_ERROR"),
          });
          return;
        }
      }

      router.push(`/listings/local/${id}`);
    },
    [imageFiles, router, selectedCategoryId, videoFile],
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
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  return {
    errors,
    handleImageChange,
    handleVideoFileChange,
    imagePreviews,
    isAllowed,
    isSubmitting,
    preview,
    removeImage,
    selectedCategory,
    selectedCategoryId,
    setCoverIndex,
    setPreview,
    setSelectedCategoryId,
    submitListing,
    videoPreview,
  };
}
