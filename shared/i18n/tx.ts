import type { AppLocale } from "./locale";
import phrasesEn from "./phrases.en.json";

const EN = phrasesEn as Record<string, string>;

const MONTHS =
  "يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر";
const DATE_RE = new RegExp(`^(\\d{1,2}) (${MONTHS})$`);

const NAME_TEMPLATES: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [
    /^مرحباً (.+)، حسابك في سوقنا نشط الآن\. ابدأ بنشر إعلان أو تصفّح العروض\.$/u,
    (match) =>
      `Hello ${match[1]}, your Sooqna account is now active. Post an ad or start browsing listings.`,
  ],
  [
    /^تم التحقق من (.+) \((.+)\)\. اعتمد الحساب بضغطة واحدة\.$/u,
    (match) =>
      `${match[1]} (${match[2]}) has been verified. Approve the account in one click.`,
  ],
  [
    /^(.+) قدّم على وظيفة «(.+)»\.$/u,
    (match) => `${match[1]} applied for “${match[2]}”.`,
  ],
  [
    /^(.+) راسلك بخصوص «(.+)»\.$/u,
    (match) => `${match[1]} messaged you about “${match[2]}”.`,
  ],
];

const UNIT_SUFFIXES: Array<[RegExp, string]> = [
  [/ قدم مربع$/u, " sq ft"],
  [/ كم$/u, " km"],
];

function lookup(text: string): string | undefined {
  const direct = EN[text];
  if (direct) return direct;
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed !== text) return EN[collapsed];
  return undefined;
}

function translateGuillemets(text: string): string | undefined {
  const amounts: string[] = [];
  const names: string[] = [];
  let template = text.replace(
    /\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*AED|AED\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?/g,
    (match) => {
      amounts.push(match);
      return "{amount}";
    },
  );
  template = template.replace(/«([^»]*)»/g, (_, inner: string) => {
    names.push(inner);
    return "«…»";
  });
  if (amounts.length === 0 && names.length === 0) return undefined;
  const hit = lookup(template);
  if (!hit) return undefined;
  let amountIndex = 0;
  let nameIndex = 0;
  return hit.replace(/\{amount\}|«…»|“…”/g, (match) => {
    if (match === "{amount}") {
      return amounts[amountIndex++] ?? "";
    }
    const value = names[nameIndex++] ?? "";
    return `“${value}”`;
  });
}

function applyUnits(text: string): string {
  let next = text;
  for (const [pattern, suffix] of UNIT_SUFFIXES) {
    if (pattern.test(next)) {
      next = next.replace(pattern, suffix);
    }
  }
  return next;
}

/**
 * Translate a stored/UI Arabic phrase when English is selected.
 * Unknown strings (including user-generated listing copy) stay unchanged.
 */
export function tx(locale: AppLocale, text: string): string {
  if (locale !== "en" || !text) return text;
  const hit = lookup(text);
  if (hit) return hit;

  const guillemet = translateGuillemets(text);
  if (guillemet) return guillemet;

  for (const [pattern, render] of NAME_TEMPLATES) {
    const match = text.match(pattern);
    if (match) return render(match);
  }

  const date = text.match(DATE_RE);
  if (date) {
    const month = lookup(date[2]);
    if (month) return `${date[1]} ${month}`;
  }

  const withUnits = applyUnits(text);
  if (withUnits !== text) {
    const unitHit = lookup(withUnits);
    return unitHit ?? withUnits;
  }

  if (text.includes(" · ")) {
    return text
      .split(" · ")
      .map((part) => lookup(part) ?? part)
      .join(" · ");
  }
  if (text.includes(" — ")) {
    return text
      .split(" — ")
      .map((part) => lookup(part) ?? part)
      .join(" — ");
  }
  if (text.includes("، ")) {
    return text
      .split("، ")
      .map((part) => lookup(part) ?? part)
      .join(", ");
  }
  return text;
}

export function txList(locale: AppLocale, items: readonly string[]): string[] {
  return items.map((item) => tx(locale, item));
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
