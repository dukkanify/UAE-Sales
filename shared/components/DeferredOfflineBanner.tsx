"use client";

import dynamic from "next/dynamic";

const OfflineBanner = dynamic(
  () =>
    import("@/shared/components/OfflineBanner").then((mod) => mod.OfflineBanner),
  { ssr: false },
);

export function DeferredOfflineBanner() {
  return <OfflineBanner />;
}
