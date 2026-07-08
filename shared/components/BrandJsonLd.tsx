import { BRAND } from "@/shared/constants/brand";

export function BrandJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `https://${BRAND.domain}/#organization`,
        alternateName: BRAND.nameAr,
        description: BRAND.description,
        logo: `https://${BRAND.domain}/brand/logo-horizontal.svg`,
        name: BRAND.nameEn,
        url: `https://${BRAND.domain}`,
      },
      {
        "@type": "WebSite",
        "@id": `https://${BRAND.domain}/#website`,
        alternateName: BRAND.nameAr,
        description: BRAND.description,
        inLanguage: "ar-AE",
        name: BRAND.nameEn,
        publisher: { "@id": `https://${BRAND.domain}/#organization` },
        url: `https://${BRAND.domain}`,
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
