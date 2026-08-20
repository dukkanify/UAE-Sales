"use client";

import type { Category } from "@/types";
import { useCallback, useRef, useState } from "react";
import { isDynamicCategory } from "@/shared/constants/category-fields";
import { getSessionUser } from "@/services/storage";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { AddListingStepProgress } from "./add-listing/AddListingStepProgress";
import { CategoryFieldsStep } from "./add-listing/CategoryFieldsStep";
import { CategorySelectionStep } from "./add-listing/CategorySelectionStep";
import { ListingDetailsStep } from "./add-listing/ListingDetailsStep";
import { ListingPreviewPanel } from "./add-listing/ListingPreviewPanel";
import { MediaContactStep } from "./add-listing/MediaContactStep";
import { useAddListingForm } from "./add-listing/useAddListingForm";

type AddListingFormProps = {
  categories: Category[];
};

export function AddListingForm({ categories }: AddListingFormProps) {
  const detailsSectionRef = useRef<HTMLDivElement>(null);
  const [defaultContact] = useState(
    () => getSessionUser()?.phone?.trim() ?? "",
  );
  const {
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
  } = useAddListingForm(categories);

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      setSelectedCategoryId(categoryId);

      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          detailsSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 120);
      });
    },
    [setSelectedCategoryId],
  );

  if (!isAllowed) {
    return (
      <LocalizedTree>
      <Card className="overflow-hidden p-8 text-center">
        <h1 className="text-2xl font-black text-ink">
          {blockReason === "pending" ? "الحساب بانتظار الاعتماد" : "يلزم تسجيل الدخول"}
        </h1>
        <p className="mt-3 text-muted">
          {blockReason === "pending"
            ? "بعد التحقق من الشخص يتم اعتماد الحساب بسهولة. يمكنك إضافة إعلان فور التفعيل."
            : "سيتم توجيهك لتسجيل الدخول قبل إضافة إعلان جديد."}
        </p>
      </Card>
      </LocalizedTree>
    );
  }

  const useDynamicFields = isDynamicCategory(selectedCategoryId);

  return (
    <LocalizedTree>
    <form
      className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:gap-6"
      noValidate
      onSubmit={submitListing}
    >
      <input name="categoryId" type="hidden" value={selectedCategoryId} />

      <div className="grid gap-4 lg:gap-6">
        <AddListingStepProgress />

        <CategorySelectionStep
          categories={categories}
          errors={errors}
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
          selectedCategoryId={selectedCategoryId}
        />

        <div
          ref={detailsSectionRef}
          className="scroll-mt-24 transition-shadow duration-500"
          id="add-listing-details"
        >
          {useDynamicFields ? (
            <CategoryFieldsStep categoryId={selectedCategoryId} errors={errors} />
          ) : (
            <ListingDetailsStep errors={errors} onPreviewChange={setPreview} />
          )}
        </div>

        <MediaContactStep
          defaultContact={defaultContact}
          errors={errors}
          featuredCheckoutAvailable={featuredCheckoutAvailable}
          imagePreviews={imagePreviews}
          onImageChange={handleImageChange}
          onPackageChange={setSelectedPackage}
          selectedPackage={selectedPackage}
        />

        <Card
          className="flex flex-wrap items-center justify-between gap-3 bg-primary p-4 text-white sm:gap-4 sm:p-5"
          id="add-listing-submit"
        >
          <div>
            <p className="font-medium">
              {selectedPackage === "featured_pending"
                ? "يُحفظ الإعلان ثم تُوجَّه لبوابة الدفع قبل تفعيل الباقة المميزة."
                : "بعد الإرسال يُراجع فريق سوقنا إعلانك قبل ظهوره في البحث."}
            </p>
            {errors.submit ? (
              <p
                className="mt-2 rounded-[var(--radius-md)] border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white"
                role="alert"
              >
                {errors.submit}
              </p>
            ) : null}
          </div>
          <Button className="shrink-0" loading={isSubmitting} type="submit">
            {selectedPackage === "featured_pending" ? "متابعة للدفع" : "إرسال للمراجعة"}
          </Button>
        </Card>
      </div>

      <ListingPreviewPanel
        imagePreviews={imagePreviews}
        preview={preview}
        selectedCategory={selectedCategory}
      />
    </form>
    </LocalizedTree>
  );
}
