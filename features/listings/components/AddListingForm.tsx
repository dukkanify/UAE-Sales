"use client";

import type { Category } from "@/types";
import { useCallback, useRef } from "react";
import { isDynamicCategory } from "@/shared/constants/category-fields";
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
  const {
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
      <Card className="overflow-hidden p-8 text-center">
        <h1 className="text-2xl font-black text-ink">يلزم تسجيل الدخول</h1>
        <p className="mt-3 text-muted">
          سيتم توجيهك لتسجيل الدخول قبل إضافة إعلان جديد.
        </p>
      </Card>
    );
  }

  const useDynamicFields = isDynamicCategory(selectedCategoryId);

  return (
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
          errors={errors}
          imagePreviews={imagePreviews}
          onImageChange={handleImageChange}
        />

        <Card className="flex flex-wrap items-center justify-between gap-3 bg-primary p-4 text-white sm:gap-4 sm:p-5">
          <p className="font-medium">
            بعد النشر سيظهر الإعلان في إعلاناتي، صفحة القسم، ونتائج البحث.
          </p>
          <Button className="shrink-0" loading={isSubmitting} type="submit">
            نشر الإعلان
          </Button>
        </Card>
      </div>

      <ListingPreviewPanel
        imagePreviews={imagePreviews}
        preview={preview}
        selectedCategory={selectedCategory}
      />
    </form>
  );
}
