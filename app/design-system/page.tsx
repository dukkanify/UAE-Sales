import type { Metadata } from "next";

import DesignSystemShowcase from "./showcase";

export const metadata: Metadata = {
  title: "Design System",
  description: "AviatorPass enterprise design system — tokens, components, and patterns.",
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
