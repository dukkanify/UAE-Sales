"use client";

import { useState } from "react";
import { ShareButton } from "@/shared/components/ShareButton";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";

type ListingDetailToolbarProps = {
  listingTitle: string;
};

export function ListingDetailToolbar({ listingTitle }: ListingDetailToolbarProps) {
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
      <ShareButton title={listingTitle} />
      <Button onClick={handlePrint} size="sm" variant="outline">
        <Icon className="shrink-0" name="photo" size={14} />
        طباعة
      </Button>
      <Button onClick={handleReport} size="sm" variant="ghost">
        <Icon className="shrink-0" name="shield" size={14} />
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
