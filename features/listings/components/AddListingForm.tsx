"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Category } from "@/types";
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

function focusFirstDetailsField(container: HTMLElement | null) {
  const field = container?.querySelector<HTMLElement>(
    "input:not([type='hidden']), textarea, select",
  );
  field?.focus({ preventScroll: true });
}

export function AddListingForm({ categories }: AddListingFormProps) {
  const categoryStepRef = useRef<HTMLDivElement>(null);
  const detailsStepRef = useRef<HTMLDivElement>(null);
  const shouldScrollToDetailsRef = useRef(false);

  const {
    categoryStepExpanded,
    errors,
    expandCategoryStep,
    handleImageChange,
    imagePreviews,
    isAllowed,
    isSubmitting,
    preview,
    selectedCategory,
    selectedCategoryId,
    selectCategory,
    setPreview,
    submitListing,
  } = useAddListingForm(categories);

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      shouldScrollToDetailsRef.current = true;
      selectCategory(categoryId);
    },
    [selectCategory],
  );

  useEffect(() => {
    if (!shouldScrollToDetailsRef.current || !selectedCategoryId) {
      return;
    }

    shouldScrollToDetailsRef.current = false;
    requestAnimationFrame(() => {
      detailsStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => focusFirstDetailsField(detailsStepRef.current), 420);
    });
  }, [selectedCategoryId]);

  const handleExpandCategoryStep = useCallback(() => {
    expandCategoryStep();
    requestAnimationFrame(() => {
      categoryStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [expandCategoryStep]);

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
      className="grid gap-6 lg:grid-cols-[1fr_22rem]"
      noValidate
      onSubmit={submitListing}
    >
      <input name="categoryId" type="hidden" value={selectedCategoryId} />

      <div className="grid gap-6">
        <AddListingStepProgress />

        <div ref={categoryStepRef}>
          <CategorySelectionStep
            categories={categories}
            errors={errors}
            isExpanded={categoryStepExpanded}
            onExpand={handleExpandCategoryStep}
            onSelectCategory={handleSelectCategory}
            selectedCategory={selectedCategory}
            selectedCategoryId={selectedCategoryId}
          />
        </div>

        {selectedCategoryId ? (
          <>
            <div ref={detailsStepRef}>
              {useDynamicFields ? (
                <CategoryFieldsStep
                  categoryId={selectedCategoryId}
                  errors={errors}
                  subcategories={selectedCategory?.subcategories ?? []}
                />
              ) : (
                <ListingDetailsStep
                  errors={errors}
                  onPreviewChange={setPreview}
                  subcategories={selectedCategory?.subcategories ?? []}
                />
              )}
            </div>

            <MediaContactStep
              errors={errors}
              imagePreviews={imagePreviews}
              onImageChange={handleImageChange}
            />

            <Card className="flex flex-wrap items-center justify-between gap-4 bg-primary p-5 text-white">
              <p className="font-medium">
                بعد النشر سيظهر الإعلان في إعلاناتي، صفحة القسم، ونتائج البحث.
              </p>
              <Button className="shrink-0" loading={isSubmitting} type="submit">
                نشر الإعلان
              </Button>
            </Card>
          </>
        ) : null}
      </div>

      <ListingPreviewPanel
        imagePreviews={imagePreviews}
        preview={preview}
        selectedCategory={selectedCategory}
      />
    </form>
  );
}
