import type { Metadata } from "next";
import { getRequestLocale } from "./locale";
import { tx } from "./tx";

export async function localizedMetadata(input: {
  description: string;
  title: string;
}): Promise<Metadata> {
  const locale = await getRequestLocale();
  const title = tx(locale, input.title);
  const description = tx(locale, input.description);
  return {
    title,
    description,
    openGraph: {
      description,
      locale: locale === "en" ? "en_AE" : "ar_AE",
      title,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      description,
      title,
    },
  };
}
