import Link from "next/link";
import type { Order } from "@/types";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Icon } from "@/shared/ui/Icon";

type OrdersListProps = {
  orders: Order[];
};

const statusLabels: Record<Order["status"], string> = {
  pending: "بانتظار الدفع",
  paid: "مدفوع",
  completed: "مكتمل",
  cancelled: "ملغي",
  disputed: "نزاع",
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        actionHref="/"
        actionLabel="تصفح الإعلانات"
        description="عند إتمام عملية شراء، ستظهر طلباتك هنا."
        title="لا توجد طلبات بعد"
      />
    );
  }

  return (
    <ul className="grid gap-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/orders/${order.id}`}>
            <Card
              className="marketplace-panel flex flex-wrap items-center justify-between gap-4 p-5 transition hover:border-primary/30"
              variant="flat"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">
                  #{order.orderNumber}
                </p>
                <p className="mt-1 font-bold text-ink">{order.listingTitle}</p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(order.createdAt).toLocaleDateString("ar-AE")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-ink">
                  {priceFormatter.format(order.totalAmount)} د.إ
                </p>
                <Badge variant="escrow">{statusLabels[order.status]}</Badge>
                <Icon className="text-muted" name="arrow-left" size={16} />
              </div>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
