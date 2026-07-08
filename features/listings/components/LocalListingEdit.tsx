"use client";

import { isDynamicCategory } from "@/shared/constants/category-fields";
import { CategoryFieldsForm } from "@/features/listings/components/add-listing/CategoryFieldsForm";
import { GenericListingFields } from "@/features/listings/components/GenericListingFields";
import { ListingMediaSection } from "@/features/listings/components/ListingMediaSection";
import { useEditListingForm } from "@/features/listings/components/useEditListingForm";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FormMessage } from "@/shared/ui/FormMessage";
import { ListingDetailSkeleton } from "@/shared/ui/Skeleton";

type LocalListingEditProps = {
  listingId: string;
};

export function LocalListingEdit({ listingId }: LocalListingEditProps) {
  const {
    defaults,
    errors,
    existingImages,
    handleImageChange,
    handleSubmit,
    imagePreviews,
    isDynamic,
    isLoading,
    listing,
    saveMessage,
  } = useEditListingForm(listingId);

  if (typeof window === "undefined") {
    return <ListingDetailSkeleton />;
  }

  if (!listing) {
    return (
      <EmptyState
        actionHref="/dashboard/listings"
        actionLabel="العودة إلى إعلاناتي"
        description="الإعلان غير موجود في هذا المتصفح. ربما تم حذفه أو لم يُحفظ بعد."
        icon="search"
        title="الإعلان غير موجود"
      />
    );
  }

  const showContactInMedia = !isDynamicCategory(listing.categoryId);

  return (
    <form className="grid gap-6" noValidate onSubmit={handleSubmit}>
      {isDynamic ? (
        <CategoryFieldsForm
          categoryId={listing.categoryId}
          defaults={defaults}
          errors={errors}
          heading="تعديل تفاصيل الإعلان"
          showContact
        />
      ) : (
        <GenericListingFields errors={errors} listing={listing} />
      )}

      <ListingMediaSection
        defaultContact={listing.contactPhone}
        errors={errors}
        existingImages={existingImages}
        imagePreviews={imagePreviews}
        onImageChange={handleImageChange}
        showContact={showContactInMedia}
        title={isDynamic ? "الصور" : "الصور والتواصل"}
      />

      {saveMessage ? (
        <FormMessage variant={saveMessage.includes("نجاح") ? "success" : "error"}>
          {saveMessage}
        </FormMessage>
      ) : null}

      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="text-sm font-medium text-muted">
          التغييرات ستظهر فوراً في صفحة الإعلان، إعلاناتي، ونتائج البحث.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button loading={isLoading} type="submit">
            حفظ التعديلات
          </Button>
          <Button href={`/listings/local/${listing.id}`} variant="secondary">
            إلغاء
          </Button>
        </div>
      </Card>
    </form>
  );
}
