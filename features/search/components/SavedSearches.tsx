"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getSavedSearches,
  removeSavedSearch,
  saveCurrentSearch,
  type SavedSearch,
} from "@/services/storage";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";

type SavedSearchesProps = {
  currentUrl: string;
  currentLabel: string;
};

export function SavedSearches({ currentLabel, currentUrl }: SavedSearchesProps) {
  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [message, setMessage] = useState("");
  const [justSavedId, setJustSavedId] = useState("");

  useEffect(() => {
    const sync = () => setSaved(getSavedSearches());
    sync();
    window.addEventListener(STORAGE_EVENTS.savedSearchesChange, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.savedSearchesChange, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function handleSave() {
    const result = saveCurrentSearch({ label: currentLabel, url: currentUrl });
    setSaved(result.items);
    if (result.alreadySaved) {
      setMessage("هذا البحث محفوظ مسبقاً في القائمة أسفل الزر.");
    } else {
      setJustSavedId(result.items[0]?.id ?? "");
      setMessage("تم الحفظ هنا أسفل الزر. تجده أيضاً في الملف الشخصي.");
    }
    window.setTimeout(() => {
      setMessage("");
      setJustSavedId("");
    }, 4000);
  }

  function handleRemove(id: string) {
    setSaved(removeSavedSearch(id));
  }

  return (
    <div className="mt-4 rounded-[var(--radius-2xl)] border border-border bg-surface-muted/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-ink">عمليات البحث المحفوظة</p>
          <p className="mt-0.5 text-[11px] leading-5 text-muted">
            تُحفظ هنا على هذا الجهاز، وتظهر أيضاً في{" "}
            <Link className="font-semibold text-ink underline-offset-2 hover:underline" href="/profile#saved-searches">
              الملف الشخصي
            </Link>
            .
          </p>
        </div>
        <Button onClick={handleSave} size="sm" type="button" variant="ghost">
          <Icon name="heart" size={14} />
          حفظ البحث
        </Button>
      </div>

      {message ? (
        <div className="mt-2">
          <FormMessage variant="success">{message}</FormMessage>
        </div>
      ) : null}

      {saved.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {saved.map((item) => (
            <li
              key={item.id}
              className={`flex items-center justify-between gap-2 rounded-[var(--radius-xl)] bg-surface px-3 py-2 ${
                item.id === justSavedId ? "ring-2 ring-secondary" : "border border-border/70"
              }`}
            >
              <Link
                className="min-w-0 flex-1 truncate text-xs font-semibold text-ink transition hover:text-primary"
                href={item.url}
              >
                {item.label}
              </Link>
              <button
                aria-label={`حذف ${item.label}`}
                className="focus-ring grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-error"
                onClick={() => handleRemove(item.id)}
                type="button"
              >
                <Icon name="close" size={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs font-medium text-muted">
          بعد الحفظ يظهر البحث في هذه القائمة مباشرة — اضغط عليه للرجوع لنفس النتائج.
        </p>
      )}
    </div>
  );
}
