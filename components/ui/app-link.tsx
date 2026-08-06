"use client";

import * as React from "react";
import NextLink from "next/link";

import { safeHref, type AppHref } from "@/lib/links/safe-href";

export type AppLinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  href: AppHref | null | undefined;
  /** Used when href is missing; defaults to home. */
  fallbackHref?: string;
};

/**
 * Drop-in Next.js Link that never forwards undefined/null/empty href.
 * Use this instead of `next/link` for dynamic or shared navigation.
 */
const AppLink = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ href, fallbackHref, ...props }, ref) => {
    const resolved = safeHref(href, fallbackHref);
    return <NextLink ref={ref} href={resolved} {...props} />;
  },
);
AppLink.displayName = "AppLink";

export { AppLink };
export default AppLink;
