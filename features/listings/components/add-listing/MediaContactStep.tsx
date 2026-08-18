"use client";

import { AppImage } from "@/shared/components/AppImage";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import type { AddListingErrors } from "./types";
import {
  addListingStepBodyClass,
  addListingStepCardClass,
  addListingStepTitleClass,
} from "./utils";

type MediaContactStepProps = {
  defaultContact?: string;
  errors: AddListingErrors;
  imagePreviews: string[];
  onImageChange: (
    fileList: FileList | null,
    mode?: "append" | "replace",
  ) => void;
  onRemoveImage: (index: number) => void;
  onSetCover: (index: number) => void;
  onVideoFileChange: (file: File | null) => void;
  videoPreview?: string;
};

export function MediaContactStep({
  defaultContact = "",
  errors,
  imagePreviews,
  onImageChange,
  onRemoveImage,
  onSetCover,
  onVideoFileChange,
  videoPreview,
}: MediaContactStepProps) {
  const hasImages = imagePreviews.length > 0;

  return (
    <Card className={addListingStepCardClass}>
      <h2 className={addListingStepTitleClass}>3. الصور والفيديو والتواصل</h2>
      <div className={`${addListingStepBodyClass} md:grid-cols-2`}>
        <div className="grid gap-3">
          <div
            className={`rounded-[var(--radius-2xl)] border border-dashed border-secondary bg-secondary-soft p-4 transition ${
              hasImages ? "min-h-0" : "min-h-40"
            }`}
          >
            {hasImages ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {imagePreviews.map((url, index) => {
                  const isCover = index === 0;
                  return (
                    <div
                      key={`${url}-${index}`}
                      className={`relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border bg-surface ${
                        isCover
                          ? "border-secondary ring-2 ring-secondary/30"
                          : "border-border"
                      }`}
                    >
                      <AppImage
                        alt={`معاينة صورة ${index + 1}`}
                        className="h-full w-full"
                        fill
                        priority={index === 0}
                        src={url}
                      />
                      {isCover ? (
                        <span className="absolute start-2 top-2 rounded-[var(--radius-md)] bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                          الصورة الأساسية
                        </span>
                      ) : (
                        <button
                          className="absolute inset-x-2 bottom-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-white"
                          onClick={() => onSetCover(index)}
                          type="button"
                        >
                          اجعلها الأساسية
                        </button>
                      )}
                      <button
                        aria-label={`حذف الصورة ${index + 1}`}
                        className="absolute end-2 top-2 grid size-6 place-items-center rounded-full bg-black/70 text-xs font-bold text-white"
                        onClick={() => onRemoveImage(index)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

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
                  required
                  type="file"
                />
                <span>
                  رفع صور الإعلان *
                  <span className="mt-2 block text-xs font-medium text-muted">
                    أضف صوراً بلا حد — اختر الصورة الأساسية بوضوح
                  </span>
                </span>
              </label>
            )}
          </div>

          {errors.images ? (
            <FormMessage variant="error">{errors.images}</FormMessage>
          ) : null}

          {hasImages ? (
            <p className="text-xs font-medium text-muted">
              {imagePreviews.length} صورة — الإطار الذهبي والصورة الأولى هما الغلاف في البحث وصفحة الإعلان.
            </p>
          ) : null}
        </div>
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
            {defaultContact ? (
              <p className="mt-1 text-xs text-muted">
                تم تعبئة الرقم من ملفك الشخصي — يمكنك تعديله لهذا الإعلان.
              </p>
            ) : null}
          </div>
          <div>
            <Input
              label="رابط فيديو يوتيوب أو مباشر (اختياري)"
              name="videoUrl"
              placeholder="https://youtu.be/..."
              type="url"
            />
            <label className="mt-2 grid cursor-pointer gap-1 rounded-[var(--radius-xl)] border border-dashed border-border bg-surface-muted/50 p-3 text-xs font-semibold text-ink">
              <span>أو ارفع ملف فيديو (حتى 12 ميغابايت)</span>
              <input
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                aria-label="رفع فيديو الإعلان"
                className="text-xs font-medium text-muted file:me-2 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-bold file:text-white"
                onChange={(event) => {
                  onVideoFileChange(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
                type="file"
              />
            </label>
            {videoPreview ? (
              <video
                className="mt-2 aspect-video w-full rounded-[var(--radius-xl)] bg-black"
                controls
                playsInline
                src={videoPreview}
              />
            ) : null}
            {errors.video ? (
              <FormMessage variant="error">{errors.video}</FormMessage>
            ) : null}
          </div>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-semibold text-ink">باقة الإعلان</legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-3">
              <input
                className="mt-1"
                defaultChecked
                name="package"
                type="radio"
                value="free"
              />
              <span>
                <span className="block text-sm font-bold text-ink">مجانية</span>
                <span className="text-xs font-medium text-muted">
                  يُراجع الإعلان ثم يظهر في السوق.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-xl)] border border-secondary/40 bg-secondary-soft/50 p-3">
              <input
                className="mt-1"
                name="package"
                type="radio"
                value="featured_pending"
              />
              <span>
                <span className="block text-sm font-bold text-ink">مميز — تحويل للدفع</span>
                <span className="text-xs font-medium text-muted">
                  بعد الإرسال تُفتح صفحة الدفع مباشرة لتمييز الإعلان.
                </span>
              </span>
            </label>
            {errors.package ? (
              <FormMessage variant="error">{errors.package}</FormMessage>
            ) : null}
          </fieldset>
        </div>
      </div>
    </Card>
  );
}
