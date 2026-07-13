import { AppImage } from "@/shared/components/AppImage";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import type { AddListingErrors } from "./types";
import {
  addListingStepBodyClass,
  addListingStepCardClass,
  addListingStepTitleClass,
} from "./utils";

type MediaContactStepProps = {
  errors: AddListingErrors;
  imagePreviews: string[];
  onImageChange: (
    fileList: FileList | null,
    mode?: "append" | "replace",
  ) => void;
};

export function MediaContactStep({
  errors,
  imagePreviews,
  onImageChange,
}: MediaContactStepProps) {
  const hasImages = imagePreviews.length > 0;

  return (
    <Card className={addListingStepCardClass}>
      <h2 className={addListingStepTitleClass}>3. الصور والتواصل</h2>
      <div className={`${addListingStepBodyClass} md:grid-cols-2`}>
        <div className="grid gap-3">
          <div
            className={`rounded-[var(--radius-2xl)] border border-dashed border-secondary bg-secondary-soft p-4 transition ${
              hasImages ? "min-h-0" : "min-h-40"
            }`}
          >
            {hasImages ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {imagePreviews.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface"
                  >
                    <AppImage
                      alt={`معاينة صورة ${index + 1}`}
                      className="h-full w-full"
                      fill
                      priority={index === 0}
                      src={url}
                    />
                    {index === 0 ? (
                      <span className="absolute start-2 top-2 rounded-[var(--radius-md)] bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        الغلاف
                      </span>
                    ) : null}
                  </div>
                ))}

                {imagePreviews.length < 6 ? (
                  <label className="grid aspect-[4/3] cursor-pointer place-items-center rounded-[var(--radius-xl)] border border-dashed border-secondary bg-surface p-3 text-center text-xs font-semibold text-primary transition hover:bg-secondary/10">
                    <input
                      accept="image/*"
                      aria-label="إضافة صور أخرى"
                      className="sr-only"
                      multiple
                      onChange={(event) => {
                        onImageChange(event.target.files, "append");
                        event.target.value = "";
                      }}
                      type="file"
                    />
                    <span>+ إضافة صور</span>
                  </label>
                ) : null}
              </div>
            ) : (
              <label className="grid min-h-32 cursor-pointer place-items-center p-2 text-center text-sm font-semibold text-primary transition hover:opacity-90">
                <input
                  accept="image/*"
                  aria-label="رفع صور الإعلان"
                  className="sr-only"
                  multiple
                  onChange={(event) => {
                    onImageChange(event.target.files, "replace");
                    event.target.value = "";
                  }}
                  type="file"
                />
                <span>
                  رفع صور الإعلان
                  <span className="mt-2 block text-xs font-medium text-muted">
                    اختر حتى 6 صور — ستظهر هنا مباشرة
                  </span>
                </span>
              </label>
            )}
          </div>

          {hasImages ? (
            <p className="text-xs font-medium text-muted">
              تم اختيار {imagePreviews.length} صورة — الصورة الأولى تظهر كغلاف في
              المعاينة
            </p>
          ) : null}
        </div>
        <div className="grid gap-4">
          <div>
            <Input
              label="رقم التواصل"
              name="contact"
              placeholder="05xxxxxxxx"
              type="tel"
            />
            {errors.contact ? (
              <FormMessage variant="error">{errors.contact}</FormMessage>
            ) : null}
          </div>
          <Select
            label="باقة الإعلان"
            name="package"
            options={[
              { label: "مجانية", value: "free" },
              { label: "مميز لمدة 7 أيام", value: "featured_7" },
              { label: "مميز لمدة 30 يوم", value: "featured_30" },
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
