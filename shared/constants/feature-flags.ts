/** UAE PASS integration — hidden by default until ready. */
export function isUaePassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_UAE_PASS === "true";
}
