"use client";

import { useEffect, useState } from "react";
import type { AdminSiteSettings } from "@/services/admin/admin-settings-store";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";

export function AdminSettingsPanel() {
  const [settings, setSettings] = useState<AdminSiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/settings", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) setSettings(data.settings as AdminSiteSettings);
      })
      .catch(() => undefined);
  }, []);

  async function handleSave() {
    if (!settings) return;
    const user = getSessionUser();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-role": "admin",
        },
        body: JSON.stringify({
          ...settings,
          actorId: user?.id,
          actorName: user?.fullName,
        }),
      });
      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings as AdminSiteSettings);
        setMessage("تم حفظ إعدادات الموقع.");
      } else {
        setMessage("تعذّر الحفظ.");
      }
    } catch {
      setMessage("تعذّر الحفظ.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">جاري تحميل الإعدادات...</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">الرسوم والمدفوعات</h2>
        <p className="admin-ops__panel-sub">تتحكم في نسبة المنصة وبوابة الدفع لكل طلب جديد.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Input
            label="رسوم المنصة %"
            type="number"
            value={String(settings.platformFeePercent)}
            onChange={(e) =>
              setSettings({
                ...settings,
                platformFeePercent: Number(e.target.value),
              })
            }
          />
          <Input
            label="رسوم البوابة %"
            type="number"
            value={String(settings.gatewayFeePercent)}
            onChange={(e) =>
              setSettings({
                ...settings,
                gatewayFeePercent: Number(e.target.value),
              })
            }
          />
          <Input
            label="رسوم ثابتة (AED)"
            type="number"
            value={String(settings.gatewayFeeFixed)}
            onChange={(e) =>
              setSettings({
                ...settings,
                gatewayFeeFixed: Number(e.target.value),
              })
            }
          />
        </div>
      </section>

      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">تشغيل الموقع</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="أيام حجز الضمان"
            type="number"
            value={String(settings.escrowHoldDays)}
            onChange={(e) =>
              setSettings({
                ...settings,
                escrowHoldDays: Number(e.target.value),
              })
            }
          />
          <Input
            label="بريد الدعم"
            type="email"
            value={settings.supportEmail}
            onChange={(e) =>
              setSettings({
                ...settings,
                supportEmail: e.target.value,
              })
            }
          />
          <Input
            label="رابط لوحة Stripe"
            value={settings.stripeDashboardUrl}
            onChange={(e) =>
              setSettings({
                ...settings,
                stripeDashboardUrl: e.target.value,
              })
            }
          />
        </div>
        <div className="mt-4 grid gap-3">
          <label className="admin-ops__toggle">
            <input
              checked={settings.maintenanceMode}
              type="checkbox"
              onChange={(e) =>
                setSettings({ ...settings, maintenanceMode: e.target.checked })
              }
            />
            <span>وضع الصيانة (إيقاف مؤقت للعمليات الحساسة)</span>
          </label>
          <label className="admin-ops__toggle">
            <input
              checked={settings.allowGuestCheckout}
              type="checkbox"
              onChange={(e) =>
                setSettings({ ...settings, allowGuestCheckout: e.target.checked })
              }
            />
            <span>السماح بالشراء كضيف</span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={saving} onClick={handleSave} type="button">
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
        {message ? <p className="text-sm font-semibold text-ink">{message}</p> : null}
      </div>
      <p className="text-xs text-muted">
        آخر تحديث: {new Date(settings.updatedAt).toLocaleString("ar-AE")}
      </p>
    </div>
  );
}
