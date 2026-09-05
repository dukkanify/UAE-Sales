"use client";

import { ShareButton } from "@/shared/components/ShareButton";
import type { Listing } from "@/types";
import type { ListingReportReceipt } from "@/types/domain/listing-report";
import { ReportListingModal } from "@/features/listings/components/ReportListingModal";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import Link from "next/link";
import { useState } from "react";

type ListingDetailToolbarProps = {
  listing: Listing;
};

export function ListingDetailToolbar({ listing }: ListingDetailToolbarProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [receipt, setReceipt] = useState<ListingReportReceipt | null>(null);

  function handlePrint() {
    window.print();
  }

  const statusHref =
    receipt?.publicToken
      ? `/report-status/${receipt.id}?token=${encodeURIComponent(receipt.publicToken)}`
      : null;

  return (
    <LocalizedTree>
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
      {receipt ? (
        <div className="w-full">
          <FormMessage variant="success">
            تم حفظ بلاغ {receipt.guest ? "الزائر" : "الحساب"} رقم{" "}
            <span dir="ltr" className="inline-block font-black">
              {receipt.id}
            </span>
            . المُبلِغ: {receipt.reporterName} · {receipt.reporterPhone}. التفاصيل في{" "}
            <Link className="font-bold underline" href="/admin/listing-reports">
              بلاغات الإعلانات
            </Link>
            {statusHref ? (
              <>
                {" "}
                ·{" "}
                <Link className="font-bold underline" href={statusHref}>
                  ملخص بلاغي
                </Link>
              </>
            ) : null}
          </FormMessage>
        </div>
      ) : null}
      <ReportListingModal
        listing={listing}
        onClose={() => setReportOpen(false)}
        onSuccess={setReceipt}
        open={reportOpen}
      />
    </div>
    </LocalizedTree>
  );
}
