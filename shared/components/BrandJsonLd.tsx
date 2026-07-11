import { BRAND } from "@/shared/constants/brand";
import { getAppUrl } from "@/shared/constants/site";

export function BrandJsonLd() {
  const siteUrl = getAppUrl();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        alternateName: BRAND.nameAr,
        description: BRAND.description,
        logo: `${siteUrl}/brand/logo-horizontal.svg`,
        name: BRAND.nameEn,
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        alternateName: BRAND.nameAr,
        description: BRAND.description,
        inLanguage: "ar-AE",
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
