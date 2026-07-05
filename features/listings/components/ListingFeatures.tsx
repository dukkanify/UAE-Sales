import type { Listing } from "@/types";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type ListingFeaturesProps = {
  listing: Listing;
};

const specLabels: Record<string, string> = {
  mileage: "العداد",
  transmission: "ناقل الحركة",
  fuel: "نوع الوقود",
  warranty: "الضمان",
  accidentHistory: "سجل الحوادث",
  regionalSpecs: "المواصفات",
  serviceHistory: "سجل الصيانة",
  vinAvailable: "رقم الهيكل",
  bedrooms: "غرف النوم",
  bathrooms: "الحمامات",
  parking: "مواقف",
  areaSqft: "المساحة",
  furnished: "التأثيث",
  developer: "المطور",
  community: "المجتمع",
  storage: "التخزين",
  color: "اللون",
  accessories: "الملحقات",
  purchaseDate: "تاريخ الشراء",
};

function formatSpecValue(key: string, value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "متاح للفحص" : "غير متاح";
  }
  if (key === "areaSqft") {
    return `${Number(value).toLocaleString("ar-AE")} قدم مربع`;
  }
  return String(value);
}

export function ListingFeatures({ listing }: ListingFeaturesProps) {
  const specEntries: { key: string; label: string; value: string }[] = [];

  if (listing.carSpecs) {
    for (const [key, value] of Object.entries(listing.carSpecs)) {
      specEntries.push({
        key,
        label: specLabels[key] ?? key,
        value: formatSpecValue(key, value),
      });
    }
  }

  if (listing.realEstateSpecs) {
    const { amenities, ...rest } = listing.realEstateSpecs;
    for (const [key, value] of Object.entries(rest)) {
      specEntries.push({
        key,
        label: specLabels[key] ?? key,
        value: formatSpecValue(key, value as string | number),
      });
    }
    if (amenities.length > 0) {
      specEntries.push({
        key: "amenities",
        label: "المرافق",
        value: amenities.join(" · "),
      });
    }
  }

  if (listing.electronicsSpecs) {
    for (const [key, value] of Object.entries(listing.electronicsSpecs)) {
      if (value === "—") continue;
      specEntries.push({
        key,
        label: specLabels[key] ?? key,
        value: String(value),
      });
    }
  }

  const hasFeatures = (listing.features?.length ?? 0) > 0 || specEntries.length > 0;

  if (!hasFeatures) {
    return null;
  }

  return (
    <Card className="mt-8 marketplace-panel p-6">
      <h2 className="text-lg font-black text-ink">المواصفات والميزات</h2>

      {specEntries.length > 0 ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {specEntries.map((entry) => (
            <div
              key={entry.key}
              className="flex items-center justify-between rounded-[var(--radius-xl)] border border-border bg-surface-muted px-4 py-3 text-sm"
            >
              <dt className="font-medium text-muted">{entry.label}</dt>
              <dd className="font-semibold text-ink">{entry.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {listing.features && listing.features.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {listing.features.map((feature) => (
            <li
              key={feature}
              className="inline-flex items-center gap-2 text-sm font-medium text-ink"
            >
              <Icon className="text-success" name="check" size={14} />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {listing.reasonForSelling ? (
          <p className="rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3 text-muted">
            <span className="font-semibold text-ink">سبب البيع: </span>
            {listing.reasonForSelling}
          </p>
        ) : null}
        {typeof listing.negotiable === "boolean" ? (
          <p className="rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3 text-muted">
            <span className="font-semibold text-ink">قابل للتفاوض: </span>
            {listing.negotiable ? "نعم" : "السعر نهائي"}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
