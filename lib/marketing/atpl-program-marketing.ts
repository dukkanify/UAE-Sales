/**
 * Resolve ATPL Program enrollment URL and pricing for marketing pages.
 */

import { routes } from "@/constants/routes";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { listProducts } from "@/services/payments/catalog-service";
import { formatMinor } from "@/services/payments/money";

export type AtplProgramMarketing = {
  enrollHref: string;
  priceLabel: string | null;
};

export function getAtplProgramMarketing(): AtplProgramMarketing {
  try {
    ensurePaymentsSeeded();
    const product =
      listProducts({ activeOnly: true }).find((p) => p.metadata?.sku === "ATPL-PACKAGE") ?? null;
    if (product) {
      return {
        enrollHref: `/student/checkout?productId=${product.id}`,
        priceLabel: formatMinor(product.priceAmount, product.currency),
      };
    }
  } catch (error) {
    console.error("[atpl-program-marketing]", error);
  }
  return { enrollHref: routes.register, priceLabel: null };
}
