import { BRAND } from "@/shared/constants/brand";
import { getAppUrl } from "@/shared/constants/site";
import { getRequestLocale } from "@/shared/i18n/locale";

export async function BrandJsonLd() {
  const locale = await getRequestLocale();
  const siteUrl = getAppUrl();
  const description =
    locale === "en" ? BRAND.descriptionEn : BRAND.description;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        alternateName: BRAND.nameAr,
        description,
        logo: `${siteUrl}/brand/logo-horizontal.svg`,
        name: BRAND.nameEn,
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        alternateName: BRAND.nameAr,
        description,
        inLanguage: locale === "en" ? "en-AE" : "ar-AE",
        name: BRAND.nameEn,
        publisher: { "@id": `${siteUrl}/#organization` },
        url: siteUrl,
      },
    ],
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      type="application/ld+json"
    />
  );
}
