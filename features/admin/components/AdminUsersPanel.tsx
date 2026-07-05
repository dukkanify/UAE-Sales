"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUserRecord } from "@/types/domain/admin";
import { AdminLoading } from "@/features/admin/components/AdminLoading";
import { AdminStatusBadge } from "@/features/admin/components/AdminStatusBadge";
import { fetchAdminUsers, patchAdminUserClient } from "@/services/admin";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [verified, setVerified] = useState("all");
  const [selected, setSelected] = useState<AdminUserRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminUsers({ query, role, verified });
    setUsers(data);
    setLoading(false);
  }, [query, role, verified]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUsers();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadUsers]);

  async function handlePatch(id: string, patch: { verified?: boolean; suspended?: boolean }) {
    setActionLoading(true);
    const updated = await patchAdminUserClient(id, patch);
    if (updated) {
      setUsers((items) => items.map((item) => (item.id === id ? updated : item)));
      if (selected?.id === id) {
        setSelected(updated);
      }
    }
    setActionLoading(false);
  }

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
      <Card className="marketplace-panel p-6" variant="flat">
        <div className="flex flex-wrap gap-3">
          <input
            className="min-w-[12rem] flex-1 rounded-[var(--radius-xl)] border border-border bg-surface px-4 py-2.5 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث بالاسم أو البريد أو الهاتف"
            value={query}
          />
          <select
            className="rounded-[var(--radius-xl)] border border-border bg-surface px-3 py-2.5 text-sm"
            onChange={(event) => setRole(event.target.value)}
            value={role}
          >
            <option value="all">كل الأدوار</option>
            <option value="user">مستخدم</option>
            <option value="business">أعمال</option>
            <option value="admin">مدير</option>
          </select>
          <select
            className="rounded-[var(--radius-xl)] border border-border bg-surface px-3 py-2.5 text-sm"
            onChange={(event) => setVerified(event.target.value)}
            value={verified}
          >
            <option value="all">كل الحالات</option>
            <option value="verified">موثق</option>
            <option value="unverified">غير موثق</option>
          </select>
        </div>

        {users.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              description="جرّب تغيير معايير البحث أو الفلاتر."
              icon="search"
              title="لا يوجد مستخدمون"
            />
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[42rem] text-sm">
              <thead>
                <tr className="border-b border-border text-right text-xs text-muted">
                  <th className="px-3 py-2 font-medium">المستخدم</th>
                  <th className="px-3 py-2 font-medium">الدور</th>
                  <th className="px-3 py-2 font-medium">الحالة</th>
                  <th className="px-3 py-2 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/60 transition hover:bg-surface-muted/50"
                  >
                    <td className="px-3 py-3">
                      <Button
                        className="h-auto justify-start p-0 text-right"
                        onClick={() => setSelected(user)}
                        type="button"
                        variant="ghost"
                      >
                        <p className="font-medium text-ink">{user.fullName}</p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </Button>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="muted">{user.role}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.verified ? (
                          <Badge variant="verified">موثق</Badge>
                        ) : (
                          <Badge variant="pending">غير موثق</Badge>
                        )}
                        {user.suspended ? (
                          <AdminStatusBadge status="suspended" />
                        ) : (
                          <AdminStatusBadge status="active" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={actionLoading}
                          onClick={() =>
                            handlePatch(user.id, { verified: !user.verified })
                          }
                          size="sm"
                          variant="secondary"
                        >
                          {user.verified ? "إلغاء التوثيق" : "توثيق"}
                        </Button>
                        <Button
                          disabled={actionLoading}
                          onClick={() =>
                            handlePatch(user.id, { suspended: !user.suspended })
                          }
                          size="sm"
                          variant={user.suspended ? "secondary" : "danger"}
                        >
                          {user.suspended ? "تفعيل" : "إيقاف"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="marketplace-panel h-fit p-5 lg:sticky lg:top-24" variant="flat">
        <h3 className="text-sm font-semibold text-ink">تفاصيل المستخدم</h3>
        {selected ? (
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">الاسم</dt>
              <dd className="font-medium text-ink">{selected.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">البريد</dt>
              <dd>{selected.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">الهاتف</dt>
              <dd>{selected.phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">الإمارة</dt>
              <dd>{selected.emirate ?? selected.city ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">تاريخ الانضمام</dt>
              <dd>{selected.joinedAt}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">عدد الإعلانات</dt>
              <dd>{selected.listingsCount ?? 0}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted">اختر مستخدماً لعرض التفاصيل.</p>
        )}
      </Card>
    </div>
  );
}
