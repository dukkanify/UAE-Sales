"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SavedSearchList } from "@/features/search/components/SavedSearchList";
import {
  getSavedSearches,
  removeSavedSearch,
  saveCurrentSearch,
  touchSavedSearch,
  type SavedSearch,
} from "@/services/storage";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import {
  addServerSavedSearch,
  removeServerSavedSearch,
  syncSavedSearchesAfterLogin,
} from "@/services/saved-searches/client";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { useToast } from "@/shared/components/ToastProvider";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { SavedSearchFilters } from "@/services/saved-searches/identity";

type SavedSearchesProps = {
  currentUrl: string;
  currentLabel: string;
  currentFilters?: SavedSearchFilters;
};

export function SavedSearches({
  currentLabel,
  currentUrl,
  currentFilters,
}: SavedSearchesProps) {
  const { showToast } = useToast();
  const sessionUser = useSyncExternalStore(
    subscribeSession,
    () => getSessionSnapshot(),
    () => null,
  );
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

  useEffect(() => {
    if (!sessionUser?.id) return;
    void syncSavedSearchesAfterLogin(sessionUser.id);
  }, [sessionUser?.id]);

  function handleSave() {
    const result = saveCurrentSearch({
      label: currentLabel,
      url: currentUrl,
      filters: currentFilters,
    });
    setSaved(result.items);
    if (result.alreadySaved) {
      setMessage("هذا البحث محفوظ بالفعل");
      setJustSavedId("");
    } else {
      setJustSavedId(result.items[0]?.id ?? "");
      setMessage("تم الحفظ هنا أسفل الزر. تجده أيضاً في الملف الشخصي.");
      if (sessionUser) {
        void addServerSavedSearch({
          label: currentLabel,
          url: currentUrl,
          query: currentFilters?.query,
          filters: currentFilters,
        });
      }
    }
    window.setTimeout(() => {
      setMessage("");
      setJustSavedId("");
    }, 2800);
  }

  function handleRemove(item: SavedSearch) {
    setSaved(removeSavedSearch(item.id));
    showToast("تم حذف البحث المحفوظ");
    if (sessionUser) {
      void removeServerSavedSearch(item.id);
    }
  }

  return (
    <div className="mt-3 rounded-[var(--radius-xl)] border border-border bg-surface-muted/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-ink">عمليات البحث المحفوظة</p>
          <p className="mt-0.5 text-[11px] leading-4 text-muted">
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
        <p className="mt-1.5 text-[11px] font-medium text-muted" role="status">
          {message}
        </p>
      ) : null}

      {saved.length > 0 ? (
        <div className={justSavedId ? "[&_li:first-child]:ring-1 [&_li:first-child]:ring-secondary" : ""}>
          <SavedSearchList
            items={saved}
            onOpen={(item) => setSaved(touchSavedSearch(item.id))}
            onRemove={handleRemove}
          />
        </div>
      ) : (
        <p className="mt-2 text-[11px] font-medium text-muted">
          بعد الحفظ يظهر البحث في هذه القائمة مباشرة — اضغط عليه للرجوع لنفس النتائج.
        </p>
      )}
    </div>
  );
}
