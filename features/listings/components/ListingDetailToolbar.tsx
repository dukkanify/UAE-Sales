"use client";

import { ShareButton } from "@/shared/components/ShareButton";
import type { Listing } from "@/types";
import { ReportListingModal } from "@/features/listings/components/ReportListingModal";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { useState } from "react";

type ListingDetailToolbarProps = {
  listing: Listing;
};

export function ListingDetailToolbar({ listing }: ListingDetailToolbarProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <ShareButton className="!min-h-9" listing={listing} />
      <Button className="!min-h-9" onClick={handlePrint} size="sm" variant="secondary">
        <Icon name="photo" size={14} />
        طباعة
      </Button>
      <Button
        className="!min-h-9"
        onClick={() => setReportOpen(true)}
        size="sm"
        variant="ghost"
      >
        <Icon name="shield" size={14} />
        إبلاغ عن الإعلان
      </Button>
      {reportMessage ? (
        <div className="w-full">
          <FormMessage variant="success">{reportMessage}</FormMessage>
        </div>
      ) : null}
      <ReportListingModal
        listing={listing}
        onClose={() => setReportOpen(false)}
        onSuccess={(guest) => {
          setReportOpen(false);
          setReportMessage(
            guest
              ? "تم استلام بلاغك. سيظهر لفريق الثقة مع اسمك وبريدك وهاتفك في بلاغات الإعلانات."
              : "تم استلام بلاغك. سيراجعه فريق الثقة وستصلك نسخة في الإشعارات.",
          );
        }}
        open={reportOpen}
      />
    </div>
  );
}
