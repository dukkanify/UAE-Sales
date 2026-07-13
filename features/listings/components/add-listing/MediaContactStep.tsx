import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import type { AddListingErrors } from "./types";

type MediaContactStepProps = {
  errors: AddListingErrors;
  imagePreviews: string[];
  onImageChange: (fileList: FileList | null) => void;
};

export function MediaContactStep({
  errors,
  imagePreviews,
  onImageChange,
}: MediaContactStepProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-black text-ink">3. الصور والتواصل</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="grid gap-3">
          <label className="grid min-h-40 cursor-pointer place-items-center rounded-[var(--radius-2xl)] border border-dashed border-secondary bg-secondary-soft p-6 text-center text-sm font-semibold text-primary transition hover:bg-secondary/20">
            <input
              accept="image/*"
              aria-label="رفع صور الإعلان"
              className="sr-only"
              multiple
              onChange={(event) => onImageChange(event.target.files)}
              type="file"
            />
            <span>
              رفع صور الإعلان
              <span className="mt-2 block text-xs font-medium text-muted">
                {imagePreviews.length > 0
                  ? `تم اختيار ${imagePreviews.length} صورة`
                  : "اختر حتى 6 صور — ستظهر في المعاينة"}
              </span>
            </span>
          </label>
          {imagePreviews.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((url, index) => (
                <div
                  key={url}
                  className="relative flex h-20 items-center justify-center overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-muted p-1"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`معاينة صورة ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                    src={url}
                  />
                </div>
              ))}
            </div>
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
