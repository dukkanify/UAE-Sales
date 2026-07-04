"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/shared/ui/Skeleton";

export const AddListingForm = dynamic(
  () =>
    import("@/features/listings/components/AddListingForm").then(
      (module) => module.AddListingForm,
    ),
  {
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-64" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-96" />
      </div>
    ),
    ssr: false,
  },
);
