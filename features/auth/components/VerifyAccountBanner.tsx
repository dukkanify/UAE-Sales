"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { getVerifyAccountPrompt } from "@/services/auth/account-access";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import { Icon } from "@/shared/ui/Icon";
import "./verify-account-banner.css";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

export function VerifyAccountBanner() {
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const user = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);
  const prompt = hydrated ? getVerifyAccountPrompt(user, pathname) : null;

  if (!prompt) return null;

  return (
    <div className="verify-account-banner" role="status">
      <div className="verify-account-banner__inner app-container">
        <div className="verify-account-banner__copy">
          <span className="verify-account-banner__mark" aria-hidden>
            <Icon name="shield" size={14} />
          </span>
          <p className="verify-account-banner__message">
            <span className="verify-account-banner__kicker">ثقة سوقنا</span>
            <span className="verify-account-banner__message--full">{prompt.message}</span>
            <span className="verify-account-banner__message--short">{prompt.shortMessage}</span>
          </p>
        </div>
        <Link className="verify-account-banner__action" href={prompt.href}>
          {prompt.actionLabel}
        </Link>
      </div>
    </div>
  );
}
