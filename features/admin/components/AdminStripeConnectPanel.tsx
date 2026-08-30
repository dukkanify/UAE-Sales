"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";

export type ConnectStatusPayload = {
  status:
    | "NOT_CONNECTED"
    | "SETUP_REQUIRED"
    | "UNDER_VERIFICATION"
    | "REQUIREMENTS_DUE"
    | "ACTIVE"
    | "RESTRICTED";
  statusLabelAr: string;
  statusLabelEn: string;
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsStatus: string;
  disabledReason: string | null;
  outstandingRequirements: string[];
  connectedAt: string | null;
  updatedAt: string | null;
  platformConfigured: boolean;
  shouldAutoRedirect: boolean;
  canOpenDashboard: boolean;
};

type Props = {
  /** When true, sync status on mount and show return messaging. */
  mode?: "manage" | "return" | "refresh";
  /** Optional hint from parent platform status load. */
  platformConfigured?: boolean;
};

const AUTO_REDIRECT_MS = 1500;

function primaryCtaLabel(
  status: ConnectStatusPayload["status"],
  mode: Props["mode"],
): string {
  if (mode === "return") return "إكمال الإعداد";
  if (status === "NOT_CONNECTED") return "ربط Stripe";
  if (status === "SETUP_REQUIRED") return "إكمال إعداد Stripe";
  if (status === "REQUIREMENTS_DUE" || status === "RESTRICTED") {
    return "إكمال الإعداد";
  }
  return "متابعة إلى Stripe";
}

function headlineForStatus(status: ConnectStatusPayload): string {
  switch (status.status) {
    case "NOT_CONNECTED":
      return "ربط Stripe";
    case "SETUP_REQUIRED":
      return "إكمال إعداد Stripe";
    case "UNDER_VERIFICATION":
      return "قيد التحقق من Stripe";
    case "REQUIREMENTS_DUE":
      return "معلومات إضافية مطلوبة";
    case "ACTIVE":
      return "Stripe متصل ومفعّل";
    case "RESTRICTED":
      return "حساب Stripe مقيّد";
    default:
      return status.statusLabelAr;
  }
}

export function AdminStripeConnectPanel({
  mode = "manage",
  platformConfigured: platformHint,
}: Props) {
  const [connect, setConnect] = useState<ConnectStatusPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    variant: "success" | "error";
  } | null>(null);
  const autoStarted = useRef(false);

  const loadStatus = useCallback(async () => {
    const res = await adminFetch("/api/admin/stripe/connect");
    const payload = await res.json();
    if (res.ok && payload?.connect) {
      setConnect(payload.connect as ConnectStatusPayload);
      return payload.connect as ConnectStatusPayload;
    }
    throw new Error(payload?.error ?? "LOAD_FAILED");
  }, []);

  const startOnboarding = useCallback(async (fromAuto = false) => {
    setBusy(true);
    if (fromAuto) setRedirecting(true);
    setMessage(null);
    try {
      const res = await adminFetch("/api/admin/stripe/connect", {
        method: "POST",
        body: JSON.stringify({ action: "onboard" }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.url) {
        setRedirecting(false);
        setMessage({
          variant: "error",
          text:
            payload?.message ??
            (payload?.error === "STRIPE_NOT_CONFIGURED"
              ? "إعداد Stripe الرئيسي غير مكتمل. يرجى إكمال إعدادات المنصة."
              : "تعذر بدء إعداد Stripe."),
        });
        if (payload?.connect) setConnect(payload.connect);
        return;
      }
      if (payload.connect) setConnect(payload.connect);
      window.location.assign(payload.url as string);
    } catch {
      setRedirecting(false);
      setMessage({ variant: "error", text: "تعذر بدء إعداد Stripe." });
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      try {
        if (mode === "return") {
          const res = await adminFetch("/api/admin/stripe/connect", {
            method: "POST",
            body: JSON.stringify({ action: "refresh-status" }),
          });
          const payload = await res.json();
          if (cancelled) return;
          if (payload?.connect) {
            const status = payload.connect as ConnectStatusPayload;
            setConnect(status);
            if (status.status === "ACTIVE") {
              setMessage({
                variant: "success",
                text: "تم تفعيل حساب Stripe بنجاح.",
              });
            } else if (
              status.status === "REQUIREMENTS_DUE" ||
              status.status === "SETUP_REQUIRED"
            ) {
              setMessage({
                variant: "error",
                text: "يحتاج Stripe إلى معلومات إضافية لإكمال التحقق.",
              });
            } else if (status.status === "UNDER_VERIFICATION") {
              setMessage({
                variant: "success",
                text: "تم إرسال المعلومات. الحساب قيد التحقق لدى Stripe.",
              });
            }
          }
          return;
        }

        if (mode === "refresh") {
          setRedirecting(true);
          await startOnboarding(true);
          return;
        }

        const status = await loadStatus();
        if (cancelled) return;
        if (
          status.shouldAutoRedirect &&
          status.platformConfigured &&
          !autoStarted.current
        ) {
          autoStarted.current = true;
          setRedirecting(true);
          timer = setTimeout(() => {
            if (!cancelled) void startOnboarding(true);
          }, AUTO_REDIRECT_MS);
        }
      } catch {
        if (!cancelled) {
          setMessage({
            variant: "error",
            text: "تعذر تحميل حالة ربط Stripe.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [loadStatus, mode, startOnboarding]);

  async function refreshStatus() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminFetch("/api/admin/stripe/connect", {
        method: "POST",
        body: JSON.stringify({ action: "refresh-status" }),
      });
      const payload = await res.json();
      if (payload?.connect) setConnect(payload.connect);
      setMessage({
        variant: "success",
        text: "تم تحديث الحالة من Stripe.",
      });
    } catch {
      setMessage({ variant: "error", text: "تعذر تحديث الحالة." });
    } finally {
      setBusy(false);
    }
  }

  async function openDashboard() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminFetch("/api/admin/stripe/connect", {
        method: "POST",
        body: JSON.stringify({ action: "dashboard" }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.url) {
        setMessage({
          variant: "error",
          text: "لوحة Stripe Express غير متاحة بعد. أكمل الإعداد أولاً.",
        });
        return;
      }
      window.open(payload.url as string, "_blank", "noopener,noreferrer");
    } catch {
      setMessage({ variant: "error", text: "تعذر فتح لوحة Stripe." });
    } finally {
      setBusy(false);
    }
  }

  const platformReady =
    connect?.platformConfigured ?? platformHint ?? false;

  if (!connect && mode !== "refresh") {
    return (
      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">ربط Stripe</h2>
        <p className="admin-ops__panel-sub">جاري تحميل حالة الحساب...</p>
      </section>
    );
  }

  if (redirecting || mode === "refresh") {
    return (
      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">ربط Stripe</h2>
        <p className="admin-ops__panel-sub" style={{ marginTop: "0.75rem" }}>
          جاري تحويلك إلى Stripe لإكمال ربط حساب الدفع...
        </p>
        {message ? (
          <div className="mt-3">
            <FormMessage variant={message.variant}>{message.text}</FormMessage>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button loading={busy} onClick={() => startOnboarding(false)} type="button">
            متابعة إلى Stripe
          </Button>
        </div>
      </section>
    );
  }

  const status = connect!;

  return (
    <section className="admin-ops__panel">
      <h2 className="admin-ops__panel-title">{headlineForStatus(status)}</h2>
      <p className="admin-ops__panel-sub">
        يتم جمع معلومات الشركة والتحقق المصرفي والهوية عبر Stripe فقط — لا تُدخل
        بيانات بنكية أو وثائق هوية داخل سوقنا.
      </p>

      {message ? (
        <div className="mt-3">
          <FormMessage variant={message.variant}>{message.text}</FormMessage>
        </div>
      ) : null}

      {!platformReady ? (
        <div className="mt-3">
          <FormMessage variant="error">
            إعداد Stripe الرئيسي غير مكتمل. يرجى إكمال إعدادات المنصة.
          </FormMessage>
        </div>
      ) : null}

      <div className="admin-ops__status-row" style={{ marginTop: "1rem" }}>
        <div
          className={`admin-ops__status-chip${
            status.status === "ACTIVE"
              ? " admin-ops__status-chip--ok"
              : status.status === "RESTRICTED" ||
                  status.status === "REQUIREMENTS_DUE"
                ? " admin-ops__status-chip--warn"
                : ""
          }`}
        >
          الحالة: {status.statusLabelAr}
        </div>
        <div className="admin-ops__status-chip">
          Charges: {status.chargesEnabled ? "enabled" : "disabled"}
        </div>
        <div className="admin-ops__status-chip">
          Payouts: {status.payoutsEnabled ? "enabled" : "disabled"}
        </div>
        <div className="admin-ops__status-chip">
          Verification:{" "}
          {status.status === "ACTIVE"
            ? "complete"
            : status.status === "UNDER_VERIFICATION"
              ? "pending"
              : status.detailsSubmitted
                ? "submitted"
                : "incomplete"}
        </div>
        {status.updatedAt ? (
          <div className="admin-ops__status-chip">
            آخر تحديث: {new Date(status.updatedAt).toLocaleString("ar-AE")}
          </div>
        ) : null}
      </div>

      {status.stripeAccountId ? (
        <p className="mt-3 text-xs text-muted">
          Account ID:{" "}
          <code className="text-[0.7rem]">{status.stripeAccountId}</code>
        </p>
      ) : null}

      {status.disabledReason ? (
        <p className="mt-2 text-sm text-muted">
          سبب التقييد: <code className="text-xs">{status.disabledReason}</code>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {status.status === "NOT_CONNECTED" ||
        status.status === "SETUP_REQUIRED" ||
        status.status === "REQUIREMENTS_DUE" ||
        status.status === "RESTRICTED" ? (
          <Button
            disabled={!platformReady}
            loading={busy}
            onClick={() => startOnboarding(false)}
            type="button"
          >
            {primaryCtaLabel(status.status, mode)}
          </Button>
        ) : null}

        {status.canOpenDashboard ? (
          <Button
            disabled={busy}
            onClick={openDashboard}
            type="button"
            variant="ghost"
          >
            فتح Stripe Dashboard
          </Button>
        ) : null}

        <Button
          disabled={busy || !platformReady || !status.stripeAccountId}
          onClick={refreshStatus}
          type="button"
          variant="ghost"
        >
          تحديث الحالة
        </Button>
      </div>
    </section>
  );
}
