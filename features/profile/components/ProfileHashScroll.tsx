"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Ensures in-app links like /profile#favorites scroll to the target section. */
export function ProfileHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/profile") return;

    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    scrollToHash();
    // Next may paint the section a tick later after client panels hydrate.
    const t = window.setTimeout(scrollToHash, 80);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [pathname]);

  return null;
}
