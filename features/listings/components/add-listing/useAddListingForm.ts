"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useImagePreviews } from "./useImagePreviews";
import { cities, countries } from "@/shared/constants/locations";
import { isDynamicCategory } from "@/shared/constants/category-fields";
import type { Category, Listing } from "@/types";
import {
  getAccountGatePath,
  isMarketplaceAccountReady,
} from "@/services/auth/account-access";
import { getSessionUser, saveLocalListing, deleteLocalListing } from "@/services/storage";
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

type SyncListingResult =
  | { ok: true }
  | { ok: false; code?: string; error: string };

async function syncListingToServer(
  listing: Listing,
): Promise<SyncListingResult> {
  try {
    const response = await fetch("/api/listings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      if (response.status === 401 || data.error === "UNAUTHORIZED") {
        return {
          ok: false,
          code: "UNAUTHORIZED",
          error: "انتهت جلسة الدخول. سجّل الدخول ثم حاول مرة أخرى.",
        };
      }
      if (data.error === "ACCOUNT_NOT_READY") {
        return {
          ok: false,
          error:
            data.message ??
            "أكمل التحقق من الشخص واعتماد الحساب قبل إضافة إعلان.",
        };
      }
      return {
        ok: false,
        error: "تعذر حفظ الإعلان على الخادم. حاول مرة أخرى.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "تعذر الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.",
    };
  }
}

function scrollToFirstError(
  nextErrors: AddListingErrors & Record<string, string | undefined>,
) {
  window.requestAnimationFrame(() => {
    const detailFields = new Set(["title", "description", "price"]);
    const hasDetailError = Object.keys(nextErrors).some((key) => detailFields.has(key));
    const targetId = hasDetailError
      ? "add-listing-details"
      : nextErrors.images
        ? "add-listing-media"
        : nextErrors.contact || nextErrors.package
          ? "add-listing-media"
          : "add-listing-submit";
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function scrollToSubmitError() {
  window.requestAnimationFrame(() => {
    document.getElementById("add-listing-submit")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}

async function discardListingDraft(listingId: string) {
  deleteLocalListing(listingId);
  try {
    await fetch(`/api/listings/${encodeURIComponent(listingId)}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    // Best-effort rollback if checkout cannot start.
  }
}

function featuredCheckoutError(code?: string): string {
  switch (code) {
    case "STRIPE_NOT_CONFIGURED":
      return "بوابة الدفع غير مفعّلة على الموقع حالياً. اختر الباقة المجانية أو حاول لاحقاً.";
    case "CHECKOUT_URL_MISSING":
      return "تعذر فتح صفحة الدفع. حاول مرة أخرى أو تواصل مع الدعم.";
    case "LISTING_NOT_FOUND":
      return "تعذر بدء الدفع — لم يُحفظ الإعلان. حاول مرة أخرى.";
    case "ALREADY_FEATURED":
      return "هذا الإعلان مميز بالفعل.";
    case "UNAUTHORIZED":
      return "انتهت جلسة الدخول. سجّل الدخول ثم حاول مرة أخرى.";
    default:
      return "تعذر بدء الدفع للباقة المميزة. حاول مرة أخرى.";
  }
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
  const [selectedPackage, setSelectedPackage] = useState("free");
  const [featuredCheckoutAvailable, setFeaturedCheckoutAvailable] = useState<
    boolean | null
  >(null);
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
      const listingPackage = String(formData.get("package") ?? "free");
      const wantsFeatured = listingPackage === "featured_pending";
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
      if (
        wantsFeatured &&
        featuredCheckoutAvailable === false
      ) {
        nextErrors.package =
          "بوابة الدفع غير متاحة حالياً. اختر الباقة المجانية أو حاول لاحقاً.";
      }

      if (Object.keys(nextErrors).length > 0) {
        nextErrors.submit = wantsFeatured
          ? "أكمل الحقول المطلوبة أعلاه قبل متابعة الدفع."
          : "أكمل الحقول المطلوبة أعلاه قبل الإرسال.";
        setErrors(nextErrors);
        scrollToFirstError(nextErrors);
        return;
      }

      setErrors({});
      publishedRef.current = true;

      const price = Number(formData.get("price") ?? 0);
      const description = String(formData.get("description") ?? "").trim();
      let persistedImages: string[];
      try {
        persistedImages = await uploadListingImages(imageFiles);
      } catch (uploadError) {
        publishedRef.current = false;
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "تعذر معالجة الصور. حاول مرة أخرى.";
        setErrors({ submit: message });
        scrollToSubmitError();
        return;
      }

      const cityName = isDynamicCategory(categoryId)
        ? parsed.city
        : cities.find((city) => city.id === parsed.city)?.name ?? "دبي";

      const id = `local-${Date.now()}`;
      const postedAt = new Date().toISOString();
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
        // Featured package stays draft until Stripe payment succeeds.
        status: wantsFeatured ? "draft" : "pending_review",
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
        ...(videoUrl ? { videoUrl } : {}),
      };

      if (!wantsFeatured) {
        saveLocalListing(listing);
      }

      const sync = await syncListingToServer(listing);

      if (wantsFeatured) {
        if (!sync.ok) {
          publishedRef.current = false;
          if (sync.code === "UNAUTHORIZED") {
            router.replace("/login?next=/listings/new");
            return;
          }
          setErrors({ submit: sync.error });
          scrollToSubmitError();
          return;
        }

        try {
          const featureRes = await fetch(`/api/listings/${id}/feature`, {
            method: "POST",
            credentials: "include",
          });
          const featureData = (await featureRes.json()) as {
            checkoutUrl?: string;
            error?: string;
            listing?: Listing;
          };

          if (
            featureRes.status === 401 ||
            featureData.error === "UNAUTHORIZED"
          ) {
            publishedRef.current = false;
            await discardListingDraft(id);
            router.replace("/login?next=/listings/new");
            return;
          }

          if (featureRes.ok && featureData.checkoutUrl) {
            // Leave draft on server; do not publish or navigate to listing.
            window.location.href = featureData.checkoutUrl;
            return;
          }

          if (featureRes.ok && featureData.listing) {
            // Mock checkout (non-production only) — payment simulated as paid.
            saveLocalListing(featureData.listing);
            router.push("/dashboard/listings?featured=1");
            return;
          }

          publishedRef.current = false;
          await discardListingDraft(id);
          setErrors({ submit: featuredCheckoutError(featureData.error) });
          scrollToSubmitError();
          return;
        } catch {
          publishedRef.current = false;
          await discardListingDraft(id);
          setErrors({ submit: featuredCheckoutError() });
          scrollToSubmitError();
          return;
        }
      }

      if (!sync.ok) {
        // Free listings can still proceed from local storage if sync fails.
      }

      router.push(`/listings/local/${id}`);
    },
    [featuredCheckoutAvailable, imageFiles, router, selectedCategoryId],
  );

  const { isLoading: isSubmitting, run: submitListing } =
    useAsyncAction(publishListing);

  useEffect(() => {
    if (isAllowed) return;
    const user = getSessionUser();
    router.replace(user ? getAccountGatePath(user) : "/login?next=/listings/new");
  }, [isAllowed, router]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/site-settings")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !data?.settings) return;
        setFeaturedCheckoutAvailable(
          Boolean(data.settings.featuredCheckoutAvailable),
        );
      })
      .catch(() => {
        if (!cancelled) setFeaturedCheckoutAvailable(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    blockReason,
    errors,
    featuredCheckoutAvailable,
    handleImageChange,
    imagePreviews,
    isAllowed,
    isSubmitting,
    preview,
    selectedCategory,
    selectedCategoryId,
    selectedPackage,
    setPreview,
    setSelectedCategoryId,
    setSelectedPackage,
    submitListing,
  };
}
