"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminUserRecord } from "@/types";
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
  pending: "قيد التفعيل",
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
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/users", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => setUsers([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.includes(q) ||
        user.city.includes(q),
    );
  }, [users, query]);

  async function patchUser(
    id: string,
    patch: Partial<Pick<AdminUserRecord, "isVerified" | "accountStatus">>,
  ) {
    const session = getSessionUser();
    if (!session) return;
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "admin",
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
          <p className="pb-2 text-xs text-muted">
            <Icon className="ms-1 inline" name="user" size={14} />
            {filtered.length} مستخدم
          </p>
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
              {!user.isVerified ? (
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
            </div>
          </Card>
        ))
      )}

      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
