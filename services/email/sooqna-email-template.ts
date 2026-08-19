import { BRAND, BRAND_COLORS } from "@/shared/constants/brand";
import { getAppUrl } from "@/shared/constants/site";
import type { AppLocale } from "@/shared/i18n/locale";

export const EMAIL_SITE_URL = getAppUrl();

export function emailSiteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAppUrl()}${normalized}`;
}

export function escapeEmailHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSooqnaEmailHtml(input: {
  bodyHtml: string;
  ctaHref?: string;
  ctaLabel?: string;
  locale?: AppLocale;
  preview?: string;
  title: string;
}): string {
  const locale = input.locale === "en" ? "en" : "ar";
  const rtl = locale === "ar";
  const navy = BRAND_COLORS.navy;
  const gold = BRAND_COLORS.gold;
  const cream = BRAND_COLORS.white;
  const siteUrl = getAppUrl();
  const logoSrc = `${siteUrl}/apple-icon`;
  const preview = input.preview
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeEmailHtml(input.preview)}</div>`
    : "";
  const cta =
    input.ctaHref && input.ctaLabel
      ? `<p style="text-align:center;margin:28px 0 8px;">
           <a href="${input.ctaHref}" style="display:inline-block;padding:13px 28px;background:${gold};color:${navy};text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
             ${escapeEmailHtml(input.ctaLabel)}
           </a>
         </p>`
      : "";
  const footer = rtl
    ? `فريق ${BRAND.nameAr}<br/>${siteUrl}`
    : `The ${BRAND.nameEn} team<br/>${siteUrl}`;

  return `
    <div style="margin:0;padding:16px;background:#f3f0ea;">
      ${preview}
      <div style="font-family:${rtl ? "Tahoma,Arial,sans-serif" : "Inter,Arial,sans-serif"};max-width:560px;width:100%;margin:0 auto;padding:28px 22px;background:${cream};color:${navy};direction:${rtl ? "rtl" : "ltr"};text-align:${rtl ? "right" : "left"};border-radius:18px;border:1px solid #e8e4de;">
        <div style="text-align:center;margin-bottom:22px;padding-bottom:16px;border-bottom:2px solid ${gold};">
          <img src="${logoSrc}" alt="${BRAND.nameAr} ${BRAND.nameEn}" width="48" height="48" style="display:inline-block;width:48px;height:48px;border-radius:12px;" />
          <strong style="display:block;margin-top:10px;font-size:24px;color:${navy};">${rtl ? BRAND.nameAr : BRAND.nameEn}</strong>
          <span style="display:block;margin-top:4px;font-size:13px;font-weight:700;color:${gold};letter-spacing:0.04em;">Sooqna | سوقنا</span>
        </div>
        <h1 style="margin:0 0 14px;font-size:20px;line-height:1.5;color:${navy};">${escapeEmailHtml(input.title)}</h1>
        ${input.bodyHtml}
        ${cta}
        <p style="font-size:13px;line-height:1.8;margin-top:28px;color:#6b6560;">${footer}</p>
      </div>
    </div>
  `.trim();
}

export function buildSooqnaEmailText(input: {
  bodyLines: string[];
  ctaHref?: string;
  ctaLabel?: string;
  locale?: AppLocale;
  title: string;
}): string {
  const locale = input.locale === "en" ? "en" : "ar";
  const lines = [input.title, "", ...input.bodyLines];
  if (input.ctaHref) {
    lines.push("", input.ctaLabel ? `${input.ctaLabel}: ${input.ctaHref}` : input.ctaHref);
  }
  lines.push(
    "",
    locale === "en" ? `The ${BRAND.nameEn} team` : `فريق ${BRAND.nameAr}`,
    getAppUrl(),
  );
  return lines.join("\n");
}
