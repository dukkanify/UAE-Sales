"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Ensures in-app links like /profile#notifications scroll to the target section. */
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
    const timers = [50, 150, 350].map((ms) => window.setTimeout(scrollToHash, ms));
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [pathname]);

  return null;
}
