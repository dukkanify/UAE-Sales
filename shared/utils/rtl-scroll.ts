/** Normalized horizontal scroll helpers for LTR and RTL tracks. */

const negativeScrollSupport = new WeakMap<HTMLElement, boolean>();

function maxScrollLeft(element: HTMLElement): number {
  return Math.max(0, element.scrollWidth - element.clientWidth);
}

function supportsNegativeScroll(element: HTMLElement): boolean {
  const cached = negativeScrollSupport.get(element);
  if (cached !== undefined) return cached;

  const previous = element.scrollLeft;
  element.scrollLeft = -1;
  const supported = element.scrollLeft < 0;
  element.scrollLeft = previous;
  negativeScrollSupport.set(element, supported);
  return supported;
}

/** Distance scrolled from the logical start of the track (0 → max). */
export function getNormalizedScrollLeft(element: HTMLElement): number {
  const max = maxScrollLeft(element);
  if (max <= 0) return 0;

  if (element.scrollLeft < 0 || supportsNegativeScroll(element)) {
    return Math.min(Math.abs(element.scrollLeft), max);
  }

  const isRtl = getComputedStyle(element).direction === "rtl";
  if (isRtl) {
    // WebKit-style RTL: scrollLeft is max at the start.
    return Math.min(Math.max(max - element.scrollLeft, 0), max);
  }

  return Math.min(Math.max(element.scrollLeft, 0), max);
}

export function setNormalizedScrollLeft(
  element: HTMLElement,
  value: number,
  behavior: ScrollBehavior = "auto",
) {
  const max = maxScrollLeft(element);
  const clamped = Math.min(Math.max(value, 0), max);

  if (supportsNegativeScroll(element)) {
    element.scrollTo({ behavior, left: -clamped });
    return;
  }

  const isRtl = getComputedStyle(element).direction === "rtl";
  if (isRtl) {
    element.scrollTo({ behavior, left: max - clamped });
    return;
  }

  element.scrollTo({ behavior, left: clamped });
}
