"use client";

import { useLayoutEffect } from "react";
import { tx } from "./tx";
import { useLocale } from "./useLocale";
import type { AppLocale } from "./locale";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "KBD"]);
const TEXT_ATTRS = ["placeholder", "title", "aria-label", "alt"] as const;

const originalText = new WeakMap<Text, string>();
const originalAttrs = new WeakMap<Element, Partial<Record<(typeof TEXT_ATTRS)[number], string>>>();

function hasArabic(value: string) {
  return /[\u0600-\u06FF]/.test(value);
}

function isSkipped(node: Node) {
  const el =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  if (!el) return true;
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.closest("[data-ugc],[data-no-tx],textarea,[contenteditable='true']")) {
    return true;
  }
  return false;
}

function syncTextNode(node: Text, locale: AppLocale) {
  if (isSkipped(node)) return;
  const current = node.nodeValue ?? "";
  const stored = originalText.get(node);

  if (locale !== "en") {
    if (stored != null && current !== stored) {
      node.nodeValue = stored;
    }
    return;
  }

  if (hasArabic(current)) {
    originalText.set(node, current);
    const next = tx("en", current);
    if (next !== current) node.nodeValue = next;
    return;
  }

  if (stored && current !== tx("en", stored)) {
    const next = tx("en", stored);
    if (next !== current) node.nodeValue = next;
  }
}

function syncElementAttrs(el: Element, locale: AppLocale) {
  if (isSkipped(el)) return;
  let bag = originalAttrs.get(el);
  for (const attr of TEXT_ATTRS) {
    const current = el.getAttribute(attr);
    if (!current) continue;
    const stored = bag?.[attr];

    if (locale !== "en") {
      if (stored != null && current !== stored) {
        el.setAttribute(attr, stored);
      }
      continue;
    }

    if (hasArabic(current)) {
      bag = { ...bag, [attr]: current };
      originalAttrs.set(el, bag);
      const next = tx("en", current);
      if (next !== current) el.setAttribute(attr, next);
    }
  }
}

function walk(root: Node, locale: AppLocale) {
  const tree = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let current: Node | null = tree.currentNode;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      syncTextNode(current as Text, locale);
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      syncElementAttrs(current as Element, locale);
    }
    current = tree.nextNode();
  }
}

/** Translates Arabic UI in client-rendered trees before paint. Skips user-generated [data-ugc] nodes. */
export function LiveLocalizer() {
  const locale = useLocale();

  useLayoutEffect(() => {
    walk(document.body, locale);
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        walk(document.body, locale);
      });
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TEXT_ATTRS],
    });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
