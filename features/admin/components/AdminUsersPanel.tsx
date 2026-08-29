"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminAction, AdminActionMatrix, AdminPermission, AdminUserRecord } from "@/types";
import {
  ALL_ADMIN_ACTIONS,
  ALL_ADMIN_PERMISSIONS,
  ADMIN_ACTION_LABELS,
  ADMIN_PERMISSION_LABELS,
} from "@/services/auth/admin-permission-checks";
import { getSessionUser } from "@/services/storage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
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

function isSuperAdminRecord(user: Pick<AdminUserRecord, "role" | "adminPermissions">) {
  return (
    user.role === "admin" &&
    (!user.adminPermissions || user.adminPermissions.length === 0)
  );
}

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<
    Record<string, AdminPermission[]>
  >({});
  const [draftMatrices, setDraftMatrices] = useState<
    Record<string, AdminActionMatrix>
  >({});
  const [message, setMessage] = useState<{
    text: string;
    variant: "success" | "error";
  } | null>(null);
  const session = getSessionUser();
  const sessionIsSuper = Boolean(
    session && isSuperAdminRecord({ role: session.role ?? "user", adminPermissions: session.adminPermissions }),
  );

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    adminFetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        const nextUsers = (data.users ?? []) as AdminUserRecord[];
        setUsers(nextUsers);
        if (nextUsers.some((item) => item.accountStatus === "pending")) {
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
        | "isVerified"
        | "accountStatus"
        | "role"
        | "adminPermissions"
        | "adminActionMatrix"
      >
    >,
  ) {
    setBusyId(id);
    setMessage(null);
    try {
      const response = await adminFetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          variant: "error",
          text:
            data.error === "CANNOT_MODIFY_SUPER_ADMIN"
              ? "لا يمكن لمدير فرعي تعديل مدير أعلى."
              : data.error === "SELF_ESCALATION"
                ? "لا يمكنك توسيع صلاحياتك بنفسك."
                : data.message ?? "تعذر حفظ التغيير.",
        });
        return;
      }
      if (data.user) {
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? data.user : user)),
        );
        setDraftPermissions((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setDraftMatrices((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        if (patch.adminPermissions || patch.adminActionMatrix) {
          setMessage({
            variant: "success",
            text: "تم حفظ صلاحيات المدير بنجاح.",
          });
        }
      }
    } finally {
      setBusyId(null);
    }
  }

  function draftFor(user: AdminUserRecord): AdminPermission[] {
    return draftPermissions[user.id] ?? user.adminPermissions ?? [];
  }

  function draftMatrixFor(user: AdminUserRecord): AdminActionMatrix {
    return draftMatrices[user.id] ?? user.adminActionMatrix ?? {};
  }

  function toggleDraftPermission(user: AdminUserRecord, permission: AdminPermission) {
    const current = draftFor(user);
    const has = current.includes(permission);
    const next = has
      ? current.filter((item) => item !== permission)
      : [...current, permission];
    setDraftPermissions((prev) => ({ ...prev, [user.id]: next }));
    if (has) {
      setDraftMatrices((prev) => {
        const matrix = { ...(prev[user.id] ?? user.adminActionMatrix ?? {}) };
        delete matrix[permission];
        return { ...prev, [user.id]: matrix };
      });
    } else {
      setDraftMatrices((prev) => ({
        ...prev,
        [user.id]: {
          ...(prev[user.id] ?? user.adminActionMatrix ?? {}),
          [permission]: [...ALL_ADMIN_ACTIONS],
        },
      }));
    }
  }

  function toggleDraftAction(
    user: AdminUserRecord,
    permission: AdminPermission,
    action: AdminAction,
  ) {
    const matrix = { ...draftMatrixFor(user) };
    const current = matrix[permission] ?? [...ALL_ADMIN_ACTIONS];
    const has = current.includes(action);
    const next = has
      ? current.filter((item) => item !== action)
      : [...current, action];
    matrix[permission] = next;
    setDraftMatrices((prev) => ({ ...prev, [user.id]: matrix }));
  }

  function hasUnsavedPermissions(user: AdminUserRecord): boolean {
    const draft = draftPermissions[user.id];
    const draftMatrix = draftMatrices[user.id];
    if (!draft && !draftMatrix) return false;
    if (draft) {
      const saved = user.adminPermissions ?? [];
      if (draft.length !== saved.length || draft.some((item) => !saved.includes(item))) {
        return true;
      }
    }
    if (draftMatrix) {
      return JSON.stringify(draftMatrix) !== JSON.stringify(user.adminActionMatrix ?? {});
    }
    return false;
  }

  return (
    <div className="grid gap-4">
      {message ? (
        <FormMessage variant={message.variant}>{message.text}</FormMessage>
      ) : null}

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
                  {user.role === "admin" ? (
                    <Badge variant={isSuperAdminRecord(user) ? "verified" : "pending"}>
                      {isSuperAdminRecord(user) ? "مدير أعلى" : "مدير فرعي"}
                    </Badge>
                  ) : null}
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
              <div className="text-start text-xs text-muted">
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
              {user.role !== "admin" && sessionIsSuper ? (
                <Button
                  loading={busyId === user.id}
                  onClick={() =>
                    patchUser(user.id, {
                      role: "admin",
                      adminPermissions: ["listings", "orders"],
                    })
                  }
                  size="sm"
                  variant="secondary"
                >
                  إنشاء مدير فرعي
                </Button>
              ) : null}
              {user.role === "admin" &&
              !isSuperAdminRecord(user) &&
              sessionIsSuper &&
              user.id !== session?.id ? (
                <Button
                  loading={busyId === user.id}
                  onClick={() =>
                    patchUser(user.id, {
                      role: "user",
                      adminPermissions: [],
                    })
                  }
                  size="sm"
                  variant="ghost"
                >
                  إلغاء صلاحية المدير
                </Button>
              ) : null}
            </div>
            {user.role === "admin" &&
            sessionIsSuper &&
            !(isSuperAdminRecord(user) && user.id !== session?.id) ? (
              <div className="mt-4 rounded-[var(--radius-xl)] border border-border bg-surface-muted/40 p-3">
                <p className="text-xs font-semibold text-ink">
                  مصفوفة الصلاحيات (عرض / إضافة / تعديل / حذف / اعتماد / تصدير)
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  فعّل الوحدة ثم حدد الإجراءات. الحفظ صريح عبر زر الحفظ — لا يتم الحفظ تلقائياً.
                </p>
                <div className="mt-3 grid gap-3">
                  {ALL_ADMIN_PERMISSIONS.map((permission) => {
                    const checked = draftFor(user).includes(permission);
                    const actions =
                      draftMatrixFor(user)[permission] ?? [...ALL_ADMIN_ACTIONS];
                    return (
                      <div
                        key={permission}
                        className="rounded-[var(--radius-lg)] border border-border/70 bg-surface p-2"
                      >
                        <label className="flex items-center gap-2 text-xs font-semibold text-ink">
                          <input
                            checked={checked}
                            disabled={
                              busyId === user.id ||
                              (user.id === session?.id && !sessionIsSuper)
                            }
                            onChange={() => toggleDraftPermission(user, permission)}
                            type="checkbox"
                          />
                          {ADMIN_PERMISSION_LABELS[permission]}
                        </label>
                        {checked ? (
                          <div className="mt-2 flex flex-wrap gap-2 ps-5">
                            {ALL_ADMIN_ACTIONS.map((action) => (
                              <label
                                key={action}
                                className="flex items-center gap-1 text-[11px] text-muted"
                              >
                                <input
                                  checked={actions.includes(action)}
                                  disabled={busyId === user.id}
                                  onChange={() =>
                                    toggleDraftAction(user, permission, action)
                                  }
                                  type="checkbox"
                                />
                                {ADMIN_ACTION_LABELS[action]}
                              </label>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    disabled={!hasUnsavedPermissions(user)}
                    loading={busyId === user.id}
                    onClick={() =>
                      patchUser(user.id, {
                        adminPermissions: draftFor(user),
                        adminActionMatrix: draftMatrixFor(user),
                      })
                    }
                    size="sm"
                    type="button"
                  >
                    حفظ الصلاحيات
                  </Button>
                  {hasUnsavedPermissions(user) ? (
                    <Button
                      onClick={() => {
                        setDraftPermissions((prev) => {
                          const next = { ...prev };
                          delete next[user.id];
                          return next;
                        });
                        setDraftMatrices((prev) => {
                          const next = { ...prev };
                          delete next[user.id];
                          return next;
                        });
                      }}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      إلغاء
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
            {user.role === "admin" &&
            isSuperAdminRecord(user) &&
            user.id !== session?.id ? (
              <p className="mt-3 text-xs text-muted">
                مدير أعلى — لا يمكن لمدير فرعي تعديل صلاحياته.
              </p>
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
