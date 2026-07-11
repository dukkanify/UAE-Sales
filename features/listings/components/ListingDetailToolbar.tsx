"use client";

import { ShareButton } from "@/shared/components/ShareButton";
import type { Listing } from "@/types";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { useState } from "react";

type ListingDetailToolbarProps = {
  listing: Listing;
};

export function ListingDetailToolbar({ listing }: ListingDetailToolbarProps) {
  const [reportMessage, setReportMessage] = useState("");

  function handlePrint() {
    window.print();
  }

  function handleReport() {
    setReportMessage("تم استلام بلاغك. سيراجعه فريق الثقة خلال 24 ساعة.");
    window.setTimeout(() => setReportMessage(""), 4000);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <ShareButton className="!min-h-9" listing={listing} />
      <Button className="!min-h-9" onClick={handlePrint} size="sm" variant="secondary">
        <Icon name="photo" size={14} />
        طباعة
      </Button>
      <Button className="!min-h-9" onClick={handleReport} size="sm" variant="ghost">
        <Icon name="shield" size={14} />
        إبلاغ عن الإعلان
      </Button>
      {reportMessage ? (
        <div className="w-full">
          <FormMessage variant="success">{reportMessage}</FormMessage>
        </div>
      ) : null}
    </div>
  );
}
