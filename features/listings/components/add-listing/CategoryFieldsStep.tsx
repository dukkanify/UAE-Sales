import type { CategoryFieldDefinition } from "@/types";
import { getCategoryFields, isDynamicCategory } from "@/shared/constants/category-fields";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import type { AddListingErrors } from "./types";

type CategoryFieldsStepProps = {
  categoryId: string;
  errors: AddListingErrors & Record<string, string | undefined>;
};

function renderField(field: CategoryFieldDefinition) {
  const name = `spec_${field.key}`;

  if (field.type === "textarea") {
    return (
      <Textarea
        key={field.key}
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

export function CategoryFieldsStep({ categoryId, errors }: CategoryFieldsStepProps) {
  if (!isDynamicCategory(categoryId)) {
    return null;
  }

  const fields = getCategoryFields(categoryId).filter(
    (field) => field.type !== "checkbox-group",
  );
  const featureField = getCategoryFields(categoryId).find(
    (field) => field.type === "checkbox-group",
  );

  return (
    <Card key={categoryId} className="p-6">
      <h2 className="text-2xl font-black text-ink">2. تفاصيل الإعلان</h2>
      <p className="mt-2 text-sm font-medium text-muted">
        الحقول تتغير تلقائياً حسب القسم المختار — يُعرض فقط ما تدخله.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            {renderField(field)}
            {errors[field.key] ? (
              <FormMessage variant="error">{String(errors[field.key])}</FormMessage>
            ) : null}
          </div>
        ))}
      </div>

      {featureField ? (
        <div className="mt-4">
          {renderField(featureField)}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input
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
            label="الوصف"
            name="description"
            placeholder="اكتب وصفاً واضحاً ومفصلاً للإعلان..."
            required
          />
          {errors.description ? (
            <FormMessage variant="error">{errors.description}</FormMessage>
          ) : null}
        </div>

        {errors.title ? (
          <FormMessage variant="error">{errors.title}</FormMessage>
        ) : null}
      </div>
    </Card>
  );
}
