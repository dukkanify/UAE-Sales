"use client";

import type { Category } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { AddListingStepProgress } from "./add-listing/AddListingStepProgress";
import { CategorySelectionStep } from "./add-listing/CategorySelectionStep";
import { ListingDetailsStep } from "./add-listing/ListingDetailsStep";
import { ListingPreviewPanel } from "./add-listing/ListingPreviewPanel";
import { MediaContactStep } from "./add-listing/MediaContactStep";
import { useAddListingForm } from "./add-listing/useAddListingForm";

type AddListingFormProps = {
  categories: Category[];
};

export function AddListingForm({ categories }: AddListingFormProps) {
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

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1fr_22rem]"
      noValidate
      onSubmit={submitListing}
    >
      <input name="categoryId" type="hidden" value={selectedCategoryId} />

      <div className="grid gap-6">
        <AddListingStepProgress />

        <CategorySelectionStep
          categories={categories}
          errors={errors}
          onSelectCategory={setSelectedCategoryId}
          selectedCategory={selectedCategory}
          selectedCategoryId={selectedCategoryId}
        />

        <ListingDetailsStep errors={errors} onPreviewChange={setPreview} />

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
      </div>

      <ListingPreviewPanel
        imagePreviews={imagePreviews}
        preview={preview}
        selectedCategory={selectedCategory}
      />
    </form>
  );
}
