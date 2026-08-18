"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminDisputeRecord, DisputeStatus, Order } from "@/types";
import { OpenDisputeForm } from "@/features/disputes/components/OpenDisputeForm";
import type { DisputeWindow } from "@/services/payments/dispute-window";
import { formatRemainingDays } from "@/services/payments/dispute-window";
import { DISPUTE_REASON_LABELS } from "@/shared/constants/disputes";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { Textarea } from "@/shared/ui/Textarea";

const statusLabels: Record<DisputeStatus, string> = {
  open: "مفتوح",
  under_review: "قيد المراجعة",
  resolved_buyer: "لصالح المشتري",
  resolved_seller: "لصالح البائع",
  closed: "مغلق",
};

function statusVariant(
  status: DisputeStatus,
): "pending" | "verified" | "rejected" | "muted" | "escrow" {
  if (status === "open") return "pending";
  if (status === "under_review") return "escrow";
  if (status === "resolved_buyer") return "verified";
  if (status === "resolved_seller") return "muted";
  return "rejected";
}

type EligibleItem = { order: Order; window: DisputeWindow };

export function DisputesDashboard() {
  const searchParams = useSearchParams();
  const requestedOrderId = (searchParams.get("orderId") ?? "").trim();
  const [disputes, setDisputes] = useState<AdminDisputeRecord[]>([]);
  const [eligible, setEligible] = useState<EligibleItem[]>([]);
  const [windowDays, setWindowDays] = useState(7);
  const [responseDays, setResponseDays] = useState(3);
  const [pickedOrderId, setPickedOrderId] = useState<string | null>(null);
  const [userId] = useState(() => getSessionUser()?.id ?? null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    fetch("/api/disputes")
      .then((res) => res.json())
      .then((data) => {
        setDisputes(data.disputes ?? []);
        setEligible(data.eligible ?? []);
        setWindowDays(data.settings?.disputeWindowDays ?? 7);
        setResponseDays(data.settings?.disputeResponseDays ?? 3);
        setLoaded(true);
      })
      .catch(() => {
        setError("تعذر تحميل النزاعات.");
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeOrderId = pickedOrderId !== null ? pickedOrderId : requestedOrderId;

  const selected = useMemo(
    () => eligible.find((item) => item.order.id === activeOrderId) ?? null,
    [activeOrderId, eligible],
  );

  const openCount = disputes.filter(
    (item) => item.status === "open" || item.status === "under_review",
  ).length;

  return (
    <div className="grid gap-5">
      <Card className="border-secondary/30 bg-secondary-soft/30 p-5" variant="flat">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#0b1628] text-secondary">
            <Icon name="shield" size={18} />
          </span>
          <div>
            <p className="text-sm font-black text-ink">مركز النزاعات في لوحة التحكم</p>
            <p className="mt-1 text-sm leading-7 text-muted">
              افتح النزاع من طلبك خلال المهلة، وأرفق الأدلة. يبقى المبلغ محجوزاً، ويُخطر البائع
              والإدارة فوراً. مهلة الفتح {windowDays} أيام من الدفع، ومهلة الرد {responseDays} أيام.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            [`${eligible.length}`, "طلبات جاهزة للفتح"],
            [`${openCount}`, "نزاعات قيد المتابعة"],
            [`${responseDays} أيام`, "مهلة رد البائع"],
          ].map(([value, label]) => (
            <div
              className="rounded-[var(--radius-xl)] border border-border/70 bg-surface px-3 py-2.5"
              key={label}
            >
              <p className="text-lg font-black text-ink">{value}</p>
              <p className="text-xs font-semibold text-muted">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {error ? <FormMessage variant="error">{error}</FormMessage> : null}

      <section>
        <h2 className="text-sm font-black text-ink">افتح نزاعاً الآن</h2>
        <p className="mt-1 text-xs text-muted">
          اختر الطلب ثم حدّد السبب. لا تحتاج نسخ رقم الطلب يدوياً.
        </p>

        {!loaded ? (
          <p className="mt-4 text-sm text-muted">جاري التحميل...</p>
        ) : eligible.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              actionHref="/orders"
              actionLabel="عرض طلباتي"
              description="يظهر هنا أي طلب مدفوع عبر الضمان وما زال داخل مهلة الفتح."
              icon="shield"
              title="لا توجد طلبات مؤهلة حالياً"
            />
          </div>
        ) : (
          <ul className="mt-3 grid gap-2">
            {eligible.map(({ order, window }) => {
              const active = activeOrderId === order.id;
              return (
                <li key={order.id}>
                  <button
                    className={`flex w-full flex-wrap items-center justify-between gap-3 rounded-[var(--radius-xl)] border px-4 py-3 text-start transition ${
                      active
                        ? "border-secondary bg-secondary-soft/50"
                        : "border-border bg-surface hover:border-secondary/40"
                    }`}
                    onClick={() =>
                      setPickedOrderId(active ? "" : order.id)
                    }
                    type="button"
                  >
                    <div>
                      <p className="font-bold text-ink">{order.listingTitle}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        متبقي {formatRemainingDays(window.remainingDays)} · حتى{" "}
                        {new Date(window.closesAt).toLocaleDateString("ar-AE")}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#0b1628] px-3 py-1 text-xs font-bold text-[#e2c882]">
                      <Icon name="plus" size={12} />
                      فتح نزاع
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {selected ? (
          <div className="mt-4">
            <OpenDisputeForm
              onOpened={load}
              order={selected.order}
              window={selected.window}
            />
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-sm font-black text-ink">نزاعاتي</h2>
        {disputes.length === 0 ? (
          <p className="mt-3 text-sm text-muted">لم تُفتح نزاعات على طلباتك بعد.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {disputes.map((dispute) => (
              <DisputeCard
                dispute={dispute}
                key={dispute.id}
                onUpdated={load}
                userId={userId}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DisputeCard({
  dispute,
  onUpdated,
  userId,
}: {
  dispute: AdminDisputeRecord;
  onUpdated: () => void;
  userId: string | null;
}) {
  const isSeller = Boolean(userId && dispute.sellerId === userId);
  const canRespond =
    isSeller &&
    (dispute.status === "open" || dispute.status === "under_review") &&
    !dispute.sellerResponse;
  const awaitingReply =
    !dispute.sellerResponse &&
    (dispute.status === "open" || dispute.status === "under_review");

  return (
    <Card className="p-5" variant="flat">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-ink">{dispute.listingTitle}</p>
          <p className="mt-1 text-xs text-muted">طلب {dispute.orderId}</p>
          {dispute.reasonCode ? (
            <p className="mt-2 text-xs font-bold text-secondary">
              {DISPUTE_REASON_LABELS[dispute.reasonCode]}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted">{dispute.reason}</p>
        </div>
        <div className="text-start">
          <CurrencyAmount amount={dispute.amount} size="md" />
          <div className="mt-2">
            <Badge variant={statusVariant(dispute.status)}>
              {statusLabels[dispute.status]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] font-semibold text-muted">
        {dispute.responseDueAt ? (
          <span
            className={`rounded-full px-2.5 py-1 ${
              awaitingReply ? "bg-warning-soft text-warning" : "bg-surface-muted"
            }`}
          >
            مهلة الرد: {new Date(dispute.responseDueAt).toLocaleDateString("ar-AE")}
            {awaitingReply ? " · بانتظار الرد" : ""}
          </span>
        ) : null}
        {dispute.windowDays ? (
          <span className="rounded-full bg-surface-muted px-2.5 py-1">
            مهلة الفتح كانت {dispute.windowDays} أيام
          </span>
        ) : null}
      </div>

      {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 ? (
        <ul className="mt-3 grid gap-1">
          {dispute.evidenceUrls.map((url) => (
            <li key={url}>
              <a
                className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                href={url}
                rel="noreferrer"
                target="_blank"
              >
                دليل مرفق
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {dispute.sellerResponse ? (
        <p className="mt-3 rounded-[var(--radius-xl)] bg-surface-muted px-3 py-2 text-sm">
          <span className="font-bold text-ink">رد البائع: </span>
          {dispute.sellerResponse}
        </p>
      ) : null}

      {dispute.resolutionNote ? (
        <p className="mt-2 text-xs text-muted">القرار: {dispute.resolutionNote}</p>
      ) : null}

      {canRespond ? <SellerReplyBox disputeId={dispute.id} onSent={onUpdated} /> : null}

      <div className="mt-4">
        <Link
          className="text-sm font-bold text-primary"
          href={`/orders/${dispute.orderId}`}
        >
          فتح الطلب
        </Link>
      </div>
    </Card>
  );
}

function SellerReplyBox({
  disputeId,
  onSent,
}: {
  disputeId: string;
  onSent: () => void;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/disputes/${disputeId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError("تعذر إرسال الرد. اكتب ٨ أحرف على الأقل.");
        return;
      }
      void data;
      setMessage("");
      onSent();
    } catch {
      setError("تعذر إرسال الرد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-4 grid gap-2" onSubmit={handleSubmit}>
      <Textarea
        label="ردك كمورد / بائع"
        minLength={8}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="اشرح موقفك أو حلّك المقترح..."
        required
        value={message}
      />
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
      <Button loading={loading} size="sm" type="submit" variant="secondary">
        إرسال الرد وإشعار المشتري
      </Button>
    </form>
  );
}
