import type { CategoryFieldDefinition, CategorySpecs, Listing, ListingCondition } from "@/types";
import { getCategoryFields, isDynamicCategory } from "@/shared/constants/category-fields";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import {
  addListingStepBodyClass,
  addListingStepCardClass,
  addListingStepDescClass,
  addListingStepTitleClass,
} from "./utils";

export type CategoryFieldErrors = Record<string, string | undefined>;

export type CategoryFieldsDefaults = {
  categorySpecs?: CategorySpecs;
  condition?: ListingCondition;
  contactPhone?: string;
  description?: string;
  features?: string[];
  negotiable?: boolean;
  price?: number;
};

type CategoryFieldsFormProps = {
  categoryId: string;
  defaults?: CategoryFieldsDefaults;
  errors: CategoryFieldErrors;
  heading?: string;
  listing?: Listing;
  showContact?: boolean;
  stepLabel?: string;
};

function getSpecValue(
  defaults: CategoryFieldsDefaults | undefined,
  key: string,
): string | number | undefined {
  const value = defaults?.categorySpecs?.[key];
  if (value === undefined || value === null || typeof value === "boolean") {
    return undefined;
  }
  return value;
}

function renderField(
  field: CategoryFieldDefinition,
  defaults: CategoryFieldsDefaults | undefined,
  selectedFeatures: string[],
) {
  const name = `spec_${field.key}`;
  const defaultValue = getSpecValue(defaults, field.key);

  if (field.type === "textarea") {
    return (
      <Textarea
        key={field.key}
        defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
        label={field.label}
        name={name}
        placeholder={field.placeholder}
        required={field.required}
      />
    );
  }

  if (field.type === "select") {
    return (
      <Select
        key={field.key}
        defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
        label={field.label}
        name={name}
        options={field.options ?? []}
        required={field.required}
      />
    );
  }

  if (field.type === "checkbox-group") {
    return (
      <fieldset key={field.key} className="grid gap-2 rounded-[var(--radius-xl)] border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-ink">{field.label}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(field.options ?? []).map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm font-medium text-muted"
            >
              <input
                className="size-4 accent-primary"
                defaultChecked={selectedFeatures.includes(option.value)}
                name={name}
                type="checkbox"
                value={option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <Input
      key={field.key}
      defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
      inputMode={field.type === "number" ? "numeric" : undefined}
      label={field.label}
      min={field.type === "number" ? "0" : undefined}
      name={name}
      placeholder={field.placeholder}
      required={field.required}
      type={field.type === "number" ? "number" : "text"}
    />
  );
}

function buildSelectedFeatures(defaults?: CategoryFieldsDefaults): string[] {
  const features = [...(defaults?.features ?? [])];
  if (defaults?.negotiable && !features.includes("قابل للتفاوض")) {
    features.push("قابل للتفاوض");
  }
  return features;
}

export function CategoryFieldsForm({
  categoryId,
  defaults,
  errors,
  heading = "تفاصيل الإعلان",
  showContact = false,
  stepLabel,
}: CategoryFieldsFormProps) {
  if (!isDynamicCategory(categoryId)) {
    return null;
  }

  const fields = getCategoryFields(categoryId).filter(
    (field) => field.type !== "checkbox-group",
  );
  const featureField = getCategoryFields(categoryId).find(
    (field) => field.type === "checkbox-group",
  );
  const selectedFeatures = buildSelectedFeatures(defaults);
  const conditionDefault =
    defaults?.categorySpecs?.condition !== undefined
      ? String(defaults.categorySpecs.condition)
      : defaults?.condition;

  return (
    <Card key={categoryId} className={addListingStepCardClass}>
      {stepLabel ? (
        <p className="text-xs font-bold uppercase tracking-wide text-secondary">
          {stepLabel}
        </p>
      ) : null}
      <h2 className={`${stepLabel ? "mt-1" : ""} ${addListingStepTitleClass}`}>
        {heading}
      </h2>
      <p className={addListingStepDescClass}>
        الحقول تتغير تلقائياً حسب القسم — يُعرض فقط ما تدخله.
      </p>

      <div className={`${addListingStepBodyClass} md:grid-cols-2`}>
        {fields.map((field) => {
          if (field.key === "condition" && conditionDefault) {
            return (
              <div key={field.key}>
                <Select
                  defaultValue={String(conditionDefault)}
                  label={field.label}
                  name={`spec_${field.key}`}
                  options={field.options ?? []}
                  required={field.required}
                />
                {errors[field.key] ? (
                  <FormMessage variant="error">{String(errors[field.key])}</FormMessage>
                ) : null}
              </div>
            );
          }

          return (
            <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
              {renderField(field, defaults, selectedFeatures)}
              {errors[field.key] ? (
                <FormMessage variant="error">{String(errors[field.key])}</FormMessage>
              ) : null}
            </div>
          );
        })}
      </div>

      {featureField ? (
        <div className="mt-4">
          {renderField(featureField, defaults, selectedFeatures)}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input
              defaultValue={defaults?.price}
              inputMode="numeric"
              label="السعر بالدرهم"
              min="1"
              name="price"
              placeholder="اكتب السعر"
              required
              type="number"
            />
            {errors.price ? (
              <FormMessage variant="error">{errors.price}</FormMessage>
            ) : null}
          </div>
        </div>

        <div>
          <Textarea
            defaultValue={defaults?.description}
            label="الوصف"
            name="description"
            placeholder="اكتب وصفاً واضحاً ومفصلاً للإعلان..."
            required
          />
          {errors.description ? (
            <FormMessage variant="error">{errors.description}</FormMessage>
          ) : null}
        </div>

        {showContact ? (
          <div>
            <Input
              defaultValue={defaults?.contactPhone}
              label="رقم التواصل"
              name="contact"
              placeholder="05xxxxxxxx"
              type="tel"
            />
            {errors.contact ? (
              <FormMessage variant="error">{errors.contact}</FormMessage>
            ) : null}
          </div>
        ) : null}

        {errors.title ? (
          <FormMessage variant="error">{errors.title}</FormMessage>
        ) : null}
      </div>
    </Card>
  );
}
