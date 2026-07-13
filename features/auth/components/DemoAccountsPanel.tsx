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
    <div className="auth-demo">
      <p className="auth-demo__title">
        {showAllDemoAccounts ? "حسابات العرض التجريبية" : "دخول المدير (عرض تجريبي)"}
      </p>
      {!showAllDemoAccounts ? (
        <p className="auth-demo__hint">
          استخدم الزر أدناه للدخول مباشرة. كلمة المرور:{" "}
          <span className="font-semibold text-ink">Admin@123</span>
        </p>
      ) : null}

      <div className="auth-demo__list">
        {accounts.map((account) => (
          <div key={account.email} className="auth-demo__item">
            <div className="min-w-0">
              <p className="auth-demo__item-label">{account.label}</p>
              <p className="mt-1 truncate text-xs text-muted">{account.email}</p>
            </div>
            <div className="auth-demo__item-actions">
              {onFillAccount ? (
                <button
                  className="auth-demo__btn auth-demo__btn--ghost"
                  disabled={isLoading}
                  onClick={() => onFillAccount(account.email, account.password)}
                  type="button"
                >
                  تعبئة
                </button>
              ) : null}
              {onLoginAccount ? (
                <button
                  className="auth-demo__btn auth-demo__btn--primary"
                  disabled={isLoading}
                  onClick={() => onLoginAccount(account.email, account.password)}
                  type="button"
                >
                  {isLoading ? "جاري الدخول..." : "دخول"}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
