import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import type { AddListingErrors } from "./add-listing/types";

type ListingMediaSectionProps = {
  errors: AddListingErrors;
  existingImages?: string[];
  imagePreviews: string[];
  onImageChange: (fileList: FileList | null) => void;
  showContact?: boolean;
  defaultContact?: string;
  title?: string;
};

export function ListingMediaSection({
  defaultContact,
  errors,
  existingImages = [],
  imagePreviews,
  onImageChange,
  showContact = true,
  title = "الصور والتواصل",
}: ListingMediaSectionProps) {
  const totalImages = existingImages.length + imagePreviews.length;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-black text-ink">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="grid gap-3">
          {existingImages.length > 0 ? (
            <div className="grid gap-2">
              <p className="text-sm font-semibold text-ink">الصور الحالية</p>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((url, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative h-20 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface"
                  >
                    <div
                      aria-label={`صورة محفوظة ${index + 1}`}
                      className="absolute inset-0 bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${url})` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <label className="grid min-h-32 cursor-pointer place-items-center rounded-[var(--radius-2xl)] border border-dashed border-secondary bg-secondary-soft p-6 text-center text-sm font-semibold text-primary transition hover:bg-secondary/20">
            <input
              accept="image/*"
              aria-label="رفع صور إضافية"
              className="sr-only"
              multiple
              onChange={(event) => onImageChange(event.target.files)}
              type="file"
            />
            <span>
              {existingImages.length > 0 ? "إضافة صور جديدة" : "رفع صور الإعلان"}
              <span className="mt-2 block text-xs font-medium text-muted">
                {totalImages > 0
                  ? `${totalImages} صورة`
                  : "اختر حتى 6 صور"}
              </span>
            </span>
          </label>

          {imagePreviews.length > 0 ? (
            <div className="grid gap-2">
              <p className="text-sm font-semibold text-ink">صور جديدة</p>
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((url, index) => (
                  <div
                    key={url}
                    className="relative h-20 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface"
                  >
                    <div
                      aria-label={`معاينة صورة جديدة ${index + 1}`}
                      className="absolute inset-0 bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${url})` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {showContact ? (
          <div className="grid gap-4">
            <div>
              <Input
                defaultValue={defaultContact}
                label="رقم التواصل"
                name="contact"
                placeholder="05xxxxxxxx"
                type="tel"
              />
              {errors.contact ? (
                <FormMessage variant="error">{errors.contact}</FormMessage>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
