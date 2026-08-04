import type { Metadata } from "next";

import DesignSystemShowcase from "./showcase";

export const metadata: Metadata = {
  title: "Design System",
  description: "ATPL PASS enterprise design system — tokens, components, and patterns.",
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
