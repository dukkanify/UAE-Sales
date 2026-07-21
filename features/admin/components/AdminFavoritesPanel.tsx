"use client";

import { useEffect, useState } from "react";
import type { ServerFavorite } from "@/types/domain/server-favorite";
import { getSessionUser } from "@/services/storage";
import { Card } from "@/shared/ui/Card";

type FavoritesPayload = {
  favorites: ServerFavorite[];
  summary: { total: number; uniqueListings: number; uniqueUsers: number };
  topListings: { count: number; listingId: string }[];
};

export function AdminFavoritesPanel() {
  const [data, setData] = useState<FavoritesPayload | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/favorites", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.summary) setData(payload as FavoritesPayload);
      })
      .catch(() => undefined);
  }, []);

  if (!data) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">جاري تحميل المفضلة...</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="admin-ops__kpi-grid">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">إجمالي الحفظ</p>
          <p className="admin-ops__kpi-value">{data.summary.total}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">إعلانات</p>
          <p className="admin-ops__kpi-value">{data.summary.uniqueListings}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">مستخدمون</p>
          <p className="admin-ops__kpi-value">{data.summary.uniqueUsers}</p>
        </div>
      </div>

      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">الأكثر إضافة للمفضلة</h2>
        <div className="admin-ops__detail-grid" style={{ marginTop: "0.75rem" }}>
          {data.topListings.length === 0 ? (
            <p className="admin-ops__queue-meta">لا بيانات بعد.</p>
          ) : (
            data.topListings.map((row) => (
              <div key={row.listingId} className="admin-ops__detail-row">
                <span>{row.listingId}</span>
                <strong>{row.count}</strong>
              </div>
            ))
          )}
        </div>
      </section>

      <ul className="admin-ops__queue">
        {data.favorites.map((item) => (
          <li key={item.id} className="admin-ops__queue-item">
            <div>
              <p className="admin-ops__queue-label">{item.title || item.listingId}</p>
              <p className="admin-ops__queue-meta">
                {item.userId} · {new Date(item.savedAt).toLocaleString("ar-AE")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
