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
        actionHref="/search"
        actionLabel="تصفح الإعلانات"
        description="عند إتمام عملية شراء، ستظهر طلباتك هنا."
        icon="cart"
        secondaryActionHref="/wallet"
        secondaryActionLabel="المحفظة"
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
              className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:border-primary/30"
              interactive
              variant="panel"
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
                <p className="text-price">
                  {priceFormatter.format(order.totalAmount)}{" "}
                  <span className="text-xs font-semibold text-muted">د.إ</span>
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
