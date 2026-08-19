"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SavedSearchList } from "@/features/search/components/SavedSearchList";
import {
  getSavedSearches,
  removeSavedSearch,
  touchSavedSearch,
  type SavedSearch,
} from "@/services/storage";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import {
  removeServerSavedSearch,
  syncSavedSearchesAfterLogin,
} from "@/services/saved-searches/client";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { useToast } from "@/shared/components/ToastProvider";
import { EmptyState } from "@/shared/ui/EmptyState";

export function ProfileSavedSearches() {
  const { showToast } = useToast();
  const sessionUser = useSyncExternalStore(
    subscribeSession,
    () => getSessionSnapshot(),
    () => null,
  );
  const [saved, setSaved] = useState<SavedSearch[]>([]);

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

  if (saved.length === 0) {
    return (
      <EmptyState
        actionHref="/search"
        actionLabel="ابحث في السوق"
        description="من نتائج البحث اضغط «حفظ البحث» — القائمة تظهر هنا وفي صفحة البحث."
        icon="search"
        title="لا توجد عمليات بحث محفوظة"
      />
    );
  }

  return (
    <SavedSearchList
      items={saved}
      onOpen={(item) => setSaved(touchSavedSearch(item.id))}
      onRemove={(item) => {
        setSaved(removeSavedSearch(item.id));
        showToast("تم حذف البحث المحفوظ");
        if (sessionUser) {
          void removeServerSavedSearch(item.id);
        }
      }}
    />
  );
}
