"use client";

import { useCallback, useState } from "react";
import type { Listing } from "@/types";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { useToast } from "@/shared/components/ToastProvider";
import { getListingCanonicalUrl } from "@/shared/listings/listing-url";
import { Icon } from "@/shared/ui/Icon";

type ShareButtonProps = {
  className?: string;
  iconOnly?: boolean;
  listing: Listing;
};

const baseClass =
  "focus-ring interactive-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface px-4 text-sm font-semibold text-ink transition";

export function ShareButton({
  className = "",
  iconOnly = false,
  listing,
}: ShareButtonProps) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const locationLabel = listing.area
    ? `${listing.area}، ${listing.emirate ?? listing.city}`
    : listing.emirate
      ? `${listing.city}، ${listing.emirate}`
      : listing.city;

  const sharePayload = {
    title: listing.title,
    text: `${listing.title} — ${locationLabel}`,
    url: getListingCanonicalUrl(listing),
  };

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sharePayload.url);
      showToast("تم نسخ رابط الإعلان");
      setModalOpen(false);
    } catch {
      showToast("تعذر نسخ الرابط", "error");
    }
  }, [sharePayload.url, showToast]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }
      setModalOpen(true);
    } catch {
      setModalOpen(true);
    }
  }, [sharePayload]);

  return (
    <>
      <button
        aria-label="مشاركة الإعلان"
        className={`${baseClass} ${className}`}
        onClick={handleShare}
        type="button"
      >
        <Icon name="share" size={18} />
        {!iconOnly ? "مشاركة" : null}
      </button>

      {modalOpen ? (
        <div
          aria-labelledby="share-dialog-title"
          aria-modal="true"
          className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-[var(--radius-2xl)] bg-surface p-6 shadow-[var(--shadow-lg)]">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-black text-ink" id="share-dialog-title">
                مشاركة الإعلان
              </h2>
              <button
                aria-label="إغلاق"
                className="focus-ring rounded-full p-1"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{listing.title}</p>
            <p className="mt-1 text-sm text-muted">{locationLabel}</p>
            <p className="mt-2">
              <CurrencyAmount amount={listing.price} size="md" />
            </p>
            <div className="mt-5 grid gap-2">
              <button
                className="min-h-11 rounded-[var(--radius-xl)] bg-surface-muted px-4 text-sm font-semibold"
                onClick={copyLink}
                type="button"
              >
                نسخ الرابط
              </button>
              <a
                className="min-h-11 rounded-[var(--radius-xl)] bg-surface-muted px-4 text-center text-sm font-semibold leading-[2.75rem]"
                href={`https://wa.me/?text=${encodeURIComponent(`${sharePayload.text}\n${sharePayload.url}`)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                واتساب
              </a>
              <a
                className="min-h-11 rounded-[var(--radius-xl)] bg-surface-muted px-4 text-center text-sm font-semibold leading-[2.75rem]"
                href={`mailto:?subject=${encodeURIComponent(listing.title)}&body=${encodeURIComponent(`${sharePayload.text}\n${sharePayload.url}`)}`}
              >
                البريد الإلكتروني
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
