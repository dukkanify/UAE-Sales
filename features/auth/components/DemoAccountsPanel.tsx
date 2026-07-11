"use client";

import { demoAccounts } from "@/mock/demo-accounts.mock";

export function DemoAccountsPanel() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="marketplace-panel mt-6 p-4 text-sm">
      <p className="text-xs font-bold text-[#B8955F]">حسابات العرض التجريبية</p>

      <div className="mt-4 grid gap-3">
        {demoAccounts.map((account) => (
          <div
            key={account.email}
            className="rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 p-3"
          >
            <p className="text-xs font-bold text-ink">{account.label}</p>
            <dl className="mt-2 grid gap-1 text-xs text-muted">
              <div className="flex justify-between gap-3">
                <dt>البريد</dt>
                <dd className="font-semibold text-ink">{account.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>كلمة المرور</dt>
                <dd className="font-semibold text-ink">{account.password}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
