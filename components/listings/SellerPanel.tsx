import type { Listing } from "@/types";
import { Card } from "@/components/ui/Card";

type SellerPanelProps = {
  listing: Listing;
};

export function SellerPanel({ listing }: SellerPanelProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-black text-ink">بيانات البائع</h2>
      <div className="mt-5 flex items-center gap-4">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-lg font-black text-primary">
          {listing.seller.name.slice(0, 2)}
        </div>
        <div>
          <p className="font-black text-ink">{listing.seller.name}</p>
          <p className="mt-1 text-sm font-bold text-muted">
            ⭐ {listing.seller.rating} تقييم البائع
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm font-bold">
        <div className="flex items-center justify-between rounded-2xl bg-surface-muted p-4">
          <span className="text-muted">هوية موثقة</span>
          <span className="text-primary">جاهز لاحقاً</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-surface-muted p-4">
          <span className="text-muted">الرد على الرسائل</span>
          <span className="text-ink">سريع</span>
        </div>
      </div>
    </Card>
  );
}
