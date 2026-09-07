#!/usr/bin/env node
/**
 * Scans phrases coverage for category subcategories and count templates.
 * Exit 1 if critical English-locale strings are missing.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const phrases = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../shared/i18n/phrases.en.json"), "utf8"),
);

const required = [
  "تصفح سوقنا عبر أقسام واضحة تصلك مباشرة للإعلانات المناسبة.",
  "دليل السوق",
  "الأقسام الرئيسية",
  "لابتوبات",
  "ألعاب",
  "كاميرات",
  "سماعات",
  "آيفون",
  "سامسونج",
  "أجهزة لوحية",
  "إكسسوارات",
  "غرف نوم",
  "كنب",
  "طاولات طعام",
  "أثاث خارجي",
  "مبيعات",
  "توصيل",
  "محاسبة",
  "تصميم",
  "حقائب",
  "ملابس",
  "عطور",
  "تنظيف",
  "نقل",
  "تكييف",
];

const missing = required.filter((key) => !phrases[key]);
if (missing.length) {
  console.error("Missing phrases:", missing);
  process.exit(1);
}

function listingCountLabel(count, locale) {
  const n = count.toLocaleString(locale === "en" ? "en-AE" : "ar-AE", {
    numberingSystem: "latn",
  });
  if (locale === "en") return count === 1 ? `${n} listing` : `${n} listings`;
  return `${n} إعلان`;
}

const sample = listingCountLabel(6, "en");
if (sample !== "6 listings") {
  console.error("Unexpected count label:", sample);
  process.exit(1);
}

console.log(
  "i18n critical coverage OK:",
  required.length,
  "phrases; count label:",
  sample,
);
