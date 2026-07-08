import type { Listing } from "@/types";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import {
  getListingFeatureItems,
  getListingSpecEntries,
} from "@/shared/listings/listing-specs";

type ListingSpecificationsProps = {
  listing: Listing;
};

export function ListingSpecifications({ listing }: ListingSpecificationsProps) {
  const specEntries = getListingSpecEntries(listing);
  const featureItems = getListingFeatureItems(listing);
  const showNegotiable =
    listing.id.startsWith("local-") &&
    typeof listing.negotiable === "boolean";
  const showReason = Boolean(listing.reasonForSelling?.trim());

  if (
    specEntries.length === 0 &&
    featureItems.length === 0 &&
    !showNegotiable &&
    !showReason
  ) {
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

      {featureItems.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {featureItems.map((feature) => (
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
        {showReason ? (
          <p className="rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3 text-muted">
            <span className="font-semibold text-ink">سبب البيع: </span>
            {listing.reasonForSelling}
          </p>
        ) : null}
        {showNegotiable ? (
          <p className="rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3 text-muted">
            <span className="font-semibold text-ink">قابل للتفاوض: </span>
            {listing.negotiable ? "نعم" : "السعر نهائي"}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

/** @deprecated Use ListingSpecifications */
export { ListingSpecifications as ListingFeatures };
