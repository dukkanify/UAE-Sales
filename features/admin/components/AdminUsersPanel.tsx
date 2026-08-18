"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminPermission, AdminUserRecord } from "@/types";
import {
  ALL_ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_LABELS,
} from "@/services/auth/admin-permission-checks";
import { getSessionUser } from "@/services/storage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { Input } from "@/shared/ui/Input";

const roleLabels: Record<AdminUserRecord["role"], string> = {
  user: "مستخدم",
  business: "أعمال",
  admin: "مدير",
};

const statusLabels: Record<AdminUserRecord["accountStatus"], string> = {
  active: "نشط",
  pending: "بانتظار الاعتماد",
  suspended: "موقوف",
};

function statusBadgeVariant(
  status: AdminUserRecord["accountStatus"],
): "verified" | "pending" | "rejected" {
  if (status === "active") return "verified";
  if (status === "pending") return "pending";
  return "rejected";
}

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    adminFetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        const nextUsers = (data.users ?? []) as AdminUserRecord[];
        setUsers(nextUsers);
        if (nextUsers.some((user) => user.accountStatus === "pending")) {
          setStatusFilter("pending");
        }
      })
      .catch(() => setUsers([]));
  }, []);

  const pendingCount = useMemo(
    () => users.filter((user) => user.accountStatus === "pending").length,
    [users],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((user) =>
        statusFilter === "pending" ? user.accountStatus === "pending" : true,
      )
      .filter((user) => {
        if (!q) return true;
        return (
          user.fullName.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.phone.includes(q) ||
          user.city.includes(q)
        );
      })
      .sort((a, b) => {
        if (a.accountStatus === "pending" && b.accountStatus !== "pending") return -1;
        if (b.accountStatus === "pending" && a.accountStatus !== "pending") return 1;
        return 0;
      });
  }, [users, query, statusFilter]);

  async function patchUser(
    id: string,
    patch: Partial<
      Pick<
        AdminUserRecord,
        "isVerified" | "accountStatus" | "role" | "adminPermissions"
      >
    >,
  ) {
    const session = getSessionUser();
    if (!session) return;
    setBusyId(id);
    try {
      const response = await adminFetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? data.user : user)),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  function togglePermission(user: AdminUserRecord, permission: AdminPermission) {
    const current = user.adminPermissions ?? [];
    const has = current.includes(permission);
    const next = has
      ? current.filter((item) => item !== permission)
      : [...current, permission];
    void patchUser(user.id, { adminPermissions: next });
  }

  return (
    <div className="grid gap-4">
      <Card className="p-4" variant="flat">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Input
              label="بحث عن مستخدم"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="الاسم، البريد، الهاتف، المدينة..."
              value={query}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-2">
            <Button
              onClick={() => setStatusFilter("all")}
              size="sm"
              type="button"
              variant={statusFilter === "all" ? "primary" : "ghost"}
            >
              الكل
            </Button>
            <Button
              onClick={() => setStatusFilter("pending")}
              size="sm"
              type="button"
              variant={statusFilter === "pending" ? "primary" : "ghost"}
            >
              بانتظار الاعتماد ({pendingCount})
            </Button>
            <p className="text-xs text-muted">
              <Icon className="ms-1 inline" name="user" size={14} />
              {filtered.length} مستخدم
            </p>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا يوجد مستخدمون مطابقون.</p>
        </Card>
      ) : (
        filtered.map((user) => (
          <Card key={user.id} className="p-5" variant="flat">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{user.fullName}</p>
                <p className="mt-1 text-xs text-muted">{user.email}</p>
                <p className="mt-1 text-sm text-muted">
                  {user.phone} — {user.city}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="muted">{roleLabels[user.role]}</Badge>
                  <Badge variant={statusBadgeVariant(user.accountStatus)}>
                    {statusLabels[user.accountStatus]}
                  </Badge>
                  {user.emailVerifiedAt ? (
                    <Badge variant="verified">تم التحقق</Badge>
                  ) : (
                    <Badge variant="pending">لم يتحقق بعد</Badge>
                  )}
                  {user.isVerified ? (
                    <Badge variant="verified">موثّق</Badge>
                  ) : (
                    <Badge variant="pending">غير موثّق</Badge>
                  )}
                </div>
              </div>
              <div className="text-left text-xs text-muted">
                <p>انضم: {user.joinedAt}</p>
                <p className="mt-1">إعلانات: {user.listingsCount}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.accountStatus === "pending" && user.emailVerifiedAt ? (
                <Button
                  loading={busyId === user.id}
                  onClick={() => patchUser(user.id, { accountStatus: "active" })}
                  size="sm"
                  variant="primary"
                >
                  اعتماد
                </Button>
              ) : null}
              {user.accountStatus === "active" && !user.isVerified ? (
                <Button
                  loading={busyId === user.id}
                  onClick={() => patchUser(user.id, { isVerified: true })}
                  size="sm"
                  variant="primary"
                >
                  توثيق
                </Button>
              ) : null}
              {user.accountStatus !== "suspended" ? (
                <Button
                  loading={busyId === user.id}
                  onClick={() =>
                    patchUser(user.id, { accountStatus: "suspended" })
                  }
                  size="sm"
                  variant="ghost"
                >
                  إيقاف
                </Button>
              ) : (
                <Button
                  loading={busyId === user.id}
                  onClick={() =>
                    patchUser(user.id, { accountStatus: "active" })
                  }
                  size="sm"
                  variant="secondary"
                >
                  إعادة تفعيل
                </Button>
              )}
              {user.role !== "admin" ? (
                <Button
                  loading={busyId === user.id}
                  onClick={() => patchUser(user.id, { role: "admin" })}
                  size="sm"
                  variant="secondary"
                >
                  ترقية لمدير
                </Button>
              ) : null}
            </div>
            {user.role === "admin" ? (
              <div className="mt-4 rounded-[var(--radius-xl)] border border-border bg-surface-muted/40 p-3">
                <p className="text-xs font-semibold text-ink">
                  صلاحيات الإدارة
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  فارغة = وصول كامل. فعّل صلاحيات محددة لتقييد الوصول.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {ALL_ADMIN_PERMISSIONS.map((permission) => {
                    const checked =
                      (user.adminPermissions ?? []).includes(permission);
                    return (
                      <label
                        key={permission}
                        className="flex items-center gap-2 text-xs text-ink"
                      >
                        <input
                          checked={checked}
                          disabled={busyId === user.id}
                          onChange={() => togglePermission(user, permission)}
                          type="checkbox"
                        />
                        {ADMIN_PERMISSION_LABELS[permission]}
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </Card>
        ))
      )}

      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
