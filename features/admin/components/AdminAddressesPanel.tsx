"use client";

import { useEffect, useState } from "react";
import type { DeliveryAddress } from "@/types/domain/address";
import { getSessionUser } from "@/services/storage";
import { Card } from "@/shared/ui/Card";

export function AdminAddressesPanel() {
  const [items, setItems] = useState<DeliveryAddress[]>([]);
  const [summary, setSummary] = useState({ total: 0, users: 0 });

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/addresses", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => {
        setItems(data.addresses ?? []);
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-4">
      <div className="admin-ops__kpi-grid">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">العناوين</p>
          <p className="admin-ops__kpi-value">{summary.total}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">المستخدمون</p>
          <p className="admin-ops__kpi-value">{summary.users}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد عناوين توصيل محفوظة بعد.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {items.map((item) => (
            <li key={item.id} className="admin-ops__queue-item">
              <div>
                <p className="admin-ops__queue-label">
                  {item.label} — {item.fullName}
                </p>
                <p className="admin-ops__queue-meta">
                  {item.emirate} / {item.city} / {item.area} · {item.street}
                </p>
                <p className="admin-ops__queue-meta">
                  {item.userId} · {item.phone}
                  {item.isDefault ? " · افتراضي" : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
