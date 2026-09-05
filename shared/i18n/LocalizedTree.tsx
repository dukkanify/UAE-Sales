"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useMemo,
  type ReactNode,
} from "react";
import { tx } from "./tx";
import { useLocale } from "./useLocale";
import type { AppLocale } from "./locale";

const TEXT_PROPS = [
  "placeholder",
  "aria-label",
  "title",
  "alt",
  "label",
  "ariaLabel",
  "error",
  "hint",
  "description",
  "eyebrow",
  "actionLabel",
] as const;

function localizeNode(node: ReactNode, locale: AppLocale): ReactNode {
  if (locale !== "en" || node == null || typeof node === "boolean") return node;
  if (typeof node === "string") return tx(locale, node);
  if (typeof node === "number") return node;
  if (Array.isArray(node)) {
    return Children.map(node, (child) => localizeNode(child, locale));
  }
  if (!isValidElement(node)) return node;

  const props = node.props as Record<string, unknown>;
  if (props.dangerouslySetInnerHTML) return node;

  const nextProps: Record<string, unknown> = {};
  let changed = false;
  for (const key of TEXT_PROPS) {
    const value = props[key];
    if (typeof value === "string") {
      const translated = tx(locale, value);
      if (translated !== value) {
        nextProps[key] = translated;
        changed = true;
      }
    }
  }

  const nextChildren =
    props.children === undefined
      ? undefined
      : localizeNode(props.children as ReactNode, locale);
  if (nextChildren !== props.children) changed = true;
  if (!changed) return node;
  return cloneElement(node, nextProps, nextChildren);
}

/** Translate Arabic UI copy created by this client component. User-generated values stay as-is unless they exactly match a UI phrase. */
export function LocalizedTree({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const localized = useMemo(
    () => localizeNode(children, locale),
    [children, locale],
  );
  return <>{localized}</>;
}

export function Copy({ text }: { text: string }) {
  return <>{tx(useLocale(), text)}</>;
}
