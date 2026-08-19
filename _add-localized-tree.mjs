import { readFileSync, writeFileSync, existsSync } from "fs";

const allFiles = [
  "app/admin/page.tsx", "app/admin/activities/page.tsx", "app/admin/addresses/page.tsx",
  "app/admin/analytics/page.tsx", "app/admin/audit/page.tsx", "app/admin/categories/page.tsx",
  "app/admin/disputes/page.tsx", "app/admin/escrow/page.tsx", "app/admin/favorites/page.tsx",
  "app/admin/job-applications/page.tsx", "app/admin/listing-reports/page.tsx",
  "app/admin/listings/page.tsx", "app/admin/locations/page.tsx", "app/admin/notifications/page.tsx",
  "app/admin/orders/page.tsx", "app/admin/quote-requests/page.tsx", "app/admin/reports/page.tsx",
  "app/admin/settings/page.tsx", "app/admin/stripe/page.tsx", "app/admin/users/page.tsx",
  "app/admin/viewing-bookings/page.tsx", "app/admin/wallets/page.tsx",
  "app/not-found.tsx", "app/global-error.tsx",
  "app/categories/page.tsx", "app/categories/[slug]/page.tsx", "app/categories/error.tsx",
  "app/chat/page.tsx", "app/chat/[conversationId]/page.tsx",
  "app/checkout/success/page.tsx",
  "app/dashboard/business-onboarding/page.tsx", "app/dashboard/listings/page.tsx",
  "app/disputes/new/page.tsx", "app/escrow/page.tsx", "app/featured/page.tsx",
  "app/forgot-password/page.tsx", "app/listings/new/page.tsx",
  "app/listings/[slug]/page.tsx", "app/listings/[slug]/edit/page.tsx", "app/listings/[slug]/error.tsx",
  "app/listings/local/[id]/edit/page.tsx",
  "app/login/page.tsx", "app/notifications/page.tsx",
  "app/orders/page.tsx", "app/orders/[id]/page.tsx",
  "app/profile/page.tsx",
  "app/register/page.tsx", "app/register/pending/page.tsx",
  "app/report-status/[id]/page.tsx",
  "app/search/page.tsx", "app/search/error.tsx",
  "app/support/page.tsx", "app/verify-email/page.tsx", "app/wallet/page.tsx",
];

const importLine = `import { LocalizedTree } from "@/shared/i18n/LocalizedTree";\n`;

let count = 0;
for (const f of allFiles) {
  if (!existsSync(f)) { console.log("SKIP (not found)", f); continue; }
  let content = readFileSync(f, "utf8");
  if (content.includes("LocalizedTree")) { console.log("SKIP (already)", f); continue; }

  const isAdmin = f.startsWith("app/admin/");
  const isClient = content.startsWith('"use client"');

  if (isClient) {
    content = content.replace('"use client";\n', '"use client";\n\n' + importLine);
    content = content.replace(/\n\n\n+/g, "\n\n");
  } else {
    content = importLine + content;
  }

  if (isAdmin) {
    content = content.replace(/return \(\n(\s+<AdminShell)/, "return (\n    <LocalizedTree>\n$1");
    content = content.replace(/(<\/AdminShell>)\n(\s+)\);/, "$1\n    </LocalizedTree>\n$2);");
  } else if (f === "app/global-error.tsx") {
    content = content.replace("<body>", "<body>\n        <LocalizedTree>");
    content = content.replace("</body>", "</LocalizedTree>\n      </body>");
  } else {
    const lines = content.split("\n");
    const result = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "<SiteHeader />" || trimmed === "<SiteHeader/>") {
        result.push(line);
        result.push(line.replace(/<SiteHeader\s*\/>/, "<LocalizedTree>"));
        continue;
      }
      if (trimmed === "<SiteFooter />" || trimmed === "<SiteFooter/>") {
        result.push(line.replace(/<SiteFooter\s*\/>/, "</LocalizedTree>"));
        result.push(line);
        continue;
      }
      result.push(line);
    }
    content = result.join("\n");
  }

  writeFileSync(f, content);
  count++;
  console.log("DONE", f);
}
console.log("Total:", count, "files modified");
