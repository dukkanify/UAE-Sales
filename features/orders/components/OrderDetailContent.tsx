"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/types";
import type { DisputeWindow } from "@/services/payments/dispute-window";
import { formatRemainingDays } from "@/services/payments/dispute-window";
import { RateOrderForm } from "@/features/orders/components/RateOrderForm";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { Input } from "@/shared/ui/Input";
import { PageHero } from "@/shared/ui/PageHero";
import { Textarea } from "@/shared/ui/Textarea";

type OrderDetailContentProps = {
  orderId: string;
  paymentSuccess?: boolean;
};

const statusLabels: Record<Order["status"], string> = {
  pending_payment: "بانتظار الدفع",
  paid_held_in_escrow: "مدفوع — محجوز في الضمان",
  delivered: "تم التسليم",
  confirmed: "تم التأكيد",
  released: "تم التحويل",
  disputed: "نزاع",
  refunded: "مسترد",
};

export function OrderDetailContent({
  orderId,
  paymentSuccess,
}: OrderDetailContentProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [disputeWindow, setDisputeWindow] = useState<DisputeWindow | null>(null);
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [proofUrlsText, setProofUrlsText] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [sessionUserId] = useState(() => getSessionUser()?.id ?? null);
  const [ratingInfo, setRatingInfo] = useState<{
    canRate: boolean;
    hasRated: boolean;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setDisputeWindow(data.disputeWindow ?? null);
        } else setError("لم يتم العثور على الطلب.");
      })
      .catch(() => setError("تعذر تحميل الطلب."));
  }, [orderId]);

  useEffect(() => {
    if (!order || order.status !== "released") return;
    const user = getSessionUser();
    if (!user || user.id !== order.buyerId) return;

    let cancelled = false;
    fetch(`/api/orders/${orderId}/rate`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setRatingInfo({
          canRate: Boolean(data.canRate),
          hasRated: Boolean(data.rating),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setRatingInfo({ canRate: false, hasRated: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [order, orderId]);

  async function handleConfirmReceived() {
    const user = getSessionUser();
    if (!user) {
      router.push(`/login?next=/orders/${orderId}`);
      return;
    }

    setIsConfirming(true);
    setConfirmMessage("");
    setError("");
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data?.error === "PROOF_REQUIRED") {
          setError("يجب أن يرفع البائع إثبات التسليم قبل تأكيد الاستلام.");
        } else {
          setError("تعذر تأكيد الاستلام.");
        }
        return;
      }
      setOrder(data.order);
      setConfirmMessage("تم تأكيد الاستلام وتحويل المبلغ للبائع.");
    } catch {
      setError("تعذر تأكيد الاستلام.");
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleConfirmMatch() {
    const user = getSessionUser();
    if (!user) {
      router.push(`/login?next=/orders/${orderId}`);
      return;
    }

    setIsMatching(true);
    setConfirmMessage("");
    setError("");
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm-match`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        if (data?.error === "PROOF_REQUIRED") {
          setError("لا يوجد إثبات من البائع بعد.");
        } else {
          setError("تعذر تأكيد المطابقة.");
        }
        return;
      }
      setOrder(data.order);
      setConfirmMessage("تم تأكيد المطابقة وتحويل المبلغ للبائع.");
    } catch {
      setError("تعذر تأكيد المطابقة.");
    } finally {
      setIsMatching(false);
    }
  }

  async function handleSubmitProof(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = getSessionUser();
    if (!user) {
      router.push(`/login?next=/orders/${orderId}`);
      return;
    }

    const proofUrls = proofUrlsText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (proofUrls.length === 0) {
      setError("أضف رابط إثبات واحد على الأقل.");
      return;
    }

    setIsSubmittingProof(true);
    setError("");
    setConfirmMessage("");
    try {
      const response = await fetch(`/api/orders/${orderId}/seller-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofUrls,
          note: proofNote.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError("تعذر رفع إثبات البائع.");
        return;
      }
      setOrder(data.order);
      setConfirmMessage("تم رفع إثبات التسليم بنجاح.");
      setProofUrlsText("");
      setProofNote("");
    } catch {
      setError("تعذر رفع إثبات البائع.");
    } finally {
      setIsSubmittingProof(false);
    }
  }

  if (!order && !error) {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">جاري تحميل الطلب...</p>
        </Card>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="app-container page-padding">
        <FormMessage variant="error">{error || "لم يتم العثور على الطلب."}</FormMessage>
      </section>
    );
  }

  const isBuyer = Boolean(sessionUserId && order.buyerId === sessionUserId);
  const isSeller = Boolean(sessionUserId && order.sellerId === sessionUserId);
  const escrowActive =
    order.status === "paid_held_in_escrow" || order.status === "delivered";
  const canConfirm = isBuyer && escrowActive;
  const showSellerProofForm = isSeller && escrowActive && !order.sellerProofAt;
  const showBuyerMatch =
    isBuyer &&
    Boolean(order.sellerProofAt) &&
    !order.buyerMatchConfirmedAt &&
    (escrowActive || order.status === "confirmed");
  const hasProof =
    Boolean(order.sellerProofAt) ||
    (order.sellerProofUrls && order.sellerProofUrls.length > 0);

  return (
    <section className="app-container page-padding">
      <PageHero
        description={`طلب رقم ${order.id}`}
        eyebrow="الطلبات"
        title={order.listingTitle}
      />

      <div className="mx-auto mt-6 max-w-2xl grid gap-5">
        {paymentSuccess ? (
          <FormMessage variant="success">تم الدفع بنجاح. المبلغ محجوز في الضمان.</FormMessage>
        ) : null}
        {confirmMessage ? (
          <FormMessage variant="success">{confirmMessage}</FormMessage>
        ) : null}
        {error ? <FormMessage variant="error">{error}</FormMessage> : null}

        <Card className="p-6" variant="flat">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{statusLabels[order.status]}</Badge>
            <Badge variant="escrow">{order.escrowStatus}</Badge>
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">البائع</span>
              <span className="font-semibold">{order.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">المشتري</span>
              <span className="font-semibold">{order.buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">الإجمالي</span>
              <CurrencyAmount amount={order.fees.total} size="md" />
            </div>
            {order.fees.shippingFee > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted">التوصيل</span>
                <CurrencyAmount amount={order.fees.shippingFee} size="sm" />
              </div>
            ) : null}
            {order.shippingMethod ? (
              <div className="flex justify-between">
                <span className="text-muted">طريقة التوصيل</span>
                <span className="font-semibold">{order.shippingMethod}</span>
              </div>
            ) : null}
            {order.stripePaymentIntentId ? (
              <div className="flex justify-between">
                <span className="text-muted">Stripe Payment</span>
                <span className="font-mono text-xs">{order.stripePaymentIntentId}</span>
              </div>
            ) : null}
          </div>
        </Card>

        {hasProof ? (
          <Card className="p-6" variant="flat">
            <h3 className="text-sm font-semibold text-ink">إثبات البائع</h3>
            {order.sellerProofNote ? (
              <p className="mt-3 text-sm text-ink">{order.sellerProofNote}</p>
            ) : null}
            {order.sellerProofUrls && order.sellerProofUrls.length > 0 ? (
              <ul className="mt-3 grid gap-2">
                {order.sellerProofUrls.map((url) => (
                  <li key={url}>
                    <a
                      className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
                      href={url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">تم تسجيل الإثبات.</p>
            )}
            {order.sellerProofAt ? (
              <p className="mt-2 text-xs text-muted">
                {new Date(order.sellerProofAt).toLocaleString("ar-AE")}
              </p>
            ) : null}
            {order.buyerMatchConfirmedAt ? (
              <p className="mt-2 text-xs font-semibold text-success">
                أكّد المشتري المطابقة في{" "}
                {new Date(order.buyerMatchConfirmedAt).toLocaleString("ar-AE")}
              </p>
            ) : null}
          </Card>
        ) : null}

        {showSellerProofForm ? (
          <Card className="p-6" variant="flat">
            <h3 className="text-sm font-semibold text-ink">رفع إثبات التسليم</h3>
            <p className="mt-1 text-sm text-muted">
              أرفق روابط صور أو مستندات تثبت تسليم السلعة للمشتري.
            </p>
            <form className="mt-4 grid gap-3" onSubmit={handleSubmitProof}>
              <Textarea
                label="روابط الإثبات"
                hint="رابط واحد في كل سطر أو مفصول بفاصلة."
                value={proofUrlsText}
                onChange={(event) => setProofUrlsText(event.target.value)}
                required
                placeholder="https://..."
              />
              <Input
                label="ملاحظة (اختياري)"
                value={proofNote}
                onChange={(event) => setProofNote(event.target.value)}
                placeholder="مثال: تم التسليم مع رقم تتبع..."
              />
              <Button loading={isSubmittingProof} type="submit" variant="accent">
                رفع الإثبات
              </Button>
            </form>
          </Card>
        ) : null}

        {showBuyerMatch ? (
          <Button
            loading={isMatching}
            onClick={handleConfirmMatch}
            size="lg"
            variant="accent"
          >
            تأكيد المطابقة
          </Button>
        ) : null}

        {canConfirm && order.sellerProofAt ? (
          <Button
            loading={isConfirming}
            onClick={handleConfirmReceived}
            size="lg"
            variant="secondary"
          >
            تأكيد الاستلام
          </Button>
        ) : null}

        {canConfirm && !order.sellerProofAt ? (
          <p className="rounded-[var(--radius-md)] border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-muted">
            بانتظار إثبات التسليم من البائع قبل تأكيد الاستلام أو المطابقة.
          </p>
        ) : null}

        {isBuyer && disputeWindow?.canOpen ? (
          <Card className="border-secondary/45 bg-secondary-soft/50 p-5" variant="flat">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-[#0b1628] text-secondary">
                <Icon name="shield" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-ink">حماية الضمان — افتح نزاعاً بسهولة</p>
                <p className="mt-1 text-sm text-muted">
                  متبقي {formatRemainingDays(disputeWindow.remainingDays)} حتى{" "}
                  {new Date(disputeWindow.closesAt).toLocaleDateString("ar-AE")}. المبلغ يبقى
                  محجوزاً ونُخطر البائع والإدارة فوراً.
                </p>
                <Button
                  className="mt-3"
                  href={`/dashboard/disputes?orderId=${encodeURIComponent(order.id)}`}
                  size="md"
                  variant="accent"
                >
                  فتح النزاع من لوحة التحكم
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {isBuyer && order.status === "disputed" ? (
          <Link
            className="inline-flex items-center justify-center rounded-[var(--radius-xl)] border border-secondary/40 bg-secondary-soft px-5 py-3 text-sm font-bold text-ink"
            href="/dashboard/disputes"
          >
            متابعة النزاع في لوحة التحكم
          </Link>
        ) : null}

        {ratingInfo?.canRate && !ratingInfo.hasRated ? (
          <RateOrderForm
            onRated={() => {
              setRatingInfo({ canRate: false, hasRated: true });
            }}
            orderId={orderId}
          />
        ) : null}

        {ratingInfo?.hasRated ? (
          <FormMessage variant="success">تم تقييم البائع لهذا الطلب.</FormMessage>
        ) : null}

        <Card className="p-6" variant="flat">
          <h3 className="text-sm font-semibold text-ink">سجل الطلب</h3>
          <ul className="mt-4 grid gap-2">
            {order.auditLog.map((event) => (
              <li
                key={event.id}
                className="rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3 text-sm"
              >
                <p className="font-semibold text-ink">{event.message}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {new Date(event.createdAt).toLocaleString("ar-AE")}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
