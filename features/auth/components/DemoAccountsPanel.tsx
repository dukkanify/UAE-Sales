"use client";

import { demoAccounts } from "@/mock/demo-accounts.mock";

const showAllDemoAccounts =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true";

const adminAccount = demoAccounts.find((account) => account.role === "admin");

type DemoAccountsPanelProps = {
  isLoading?: boolean;
  onFillAccount?: (email: string, password: string) => void;
  onLoginAccount?: (email: string, password: string) => void;
};

export function DemoAccountsPanel({
  isLoading = false,
  onFillAccount,
  onLoginAccount,
}: DemoAccountsPanelProps) {
  if (!adminAccount && !showAllDemoAccounts) {
    return null;
  }

  const accounts = showAllDemoAccounts
    ? demoAccounts
    : adminAccount
      ? [adminAccount]
      : [];

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="marketplace-panel mt-6 p-4 text-sm">
      <p className="text-xs font-bold text-[#B8955F]">
        {showAllDemoAccounts ? "حسابات العرض التجريبية" : "دخول المدير (عرض تجريبي)"}
      </p>
      {!showAllDemoAccounts ? (
        <p className="mt-2 text-xs leading-6 text-muted">
          استخدم الزر أدناه للدخول مباشرة. كلمة المرور حساسة لحالة الأحرف:{" "}
          <span className="font-semibold text-ink">Admin@123</span>
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {accounts.map((account) => (
          <div
            key={account.email}
            className="rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-bold text-ink">{account.label}</p>
              <div className="flex shrink-0 gap-2">
                {onFillAccount ? (
                  <button
                    className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold text-primary transition hover:border-secondary/50 disabled:opacity-60"
                    disabled={isLoading}
                    onClick={() => onFillAccount(account.email, account.password)}
                    type="button"
                  >
                    تعبئة
                  </button>
                ) : null}
                {onLoginAccount ? (
                  <button
                    className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                    disabled={isLoading}
                    onClick={() => onLoginAccount(account.email, account.password)}
                    type="button"
                  >
                    {isLoading ? "جاري الدخول..." : "دخول مباشر"}
                  </button>
                ) : null}
              </div>
            </div>
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
