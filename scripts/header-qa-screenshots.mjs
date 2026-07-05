import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = "/opt/cursor/artifacts/screenshots";
const BASE = "http://localhost:3000";

const demoUser = {
  id: "demo-user-001",
  accountType: "individual",
  city: "دبي",
  email: "user@uaesales.demo",
  favoritesCount: 32,
  fullName: "Ahmed Al Mansoori",
  isVerified: true,
  joinedAt: "2025-03-12",
  listingsCount: 8,
  phone: "0501234567",
  role: "user",
  walletBalance: 18750,
};

async function capture(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`saved: ${file}`);
}

async function checkAddListingButton(page) {
  const btn = page.locator('a[href="/listings/new"]').filter({ hasText: "أضف إعلانك" }).first();
  await btn.waitFor({ state: "visible", timeout: 10000 });
  const box = await btn.boundingBox();
  const text = await btn.innerText();
  const styles = await btn.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      overflow: cs.overflow,
      whiteSpace: cs.whiteSpace,
      paddingInline: `${cs.paddingLeft} / ${cs.paddingRight}`,
      minWidth: cs.minWidth,
      height: cs.height,
      display: cs.display,
      alignItems: cs.alignItems,
      justifyContent: cs.justifyContent,
      gap: cs.gap,
    };
  });
  const clipped = await btn.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return el.scrollWidth > r.width + 1 || el.scrollHeight > r.height + 1;
  });
  return { box, text: text.trim(), styles, clipped };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  // Desktop logged out - homepage (MarketHeader)
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "ar-AE" });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await capture(page, "header-desktop-logged-out-home.png");
    const dir = await page.evaluate(() => document.documentElement.dir);
    results.push({ case: "desktop-logged-out-home", dir, ...(await checkAddListingButton(page)) });
    await ctx.close();
  }

  // Desktop logged in - search (SiteHeader)
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "ar-AE" });
    await ctx.addInitScript((user) => {
      localStorage.setItem("uae-sales-session", JSON.stringify(user));
    }, demoUser);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/search`, { waitUntil: "networkidle" });
    await capture(page, "header-desktop-logged-in-search.png");
    results.push({ case: "desktop-logged-in-search", ...(await checkAddListingButton(page)) });
    await ctx.close();
  }

  // Tablet logged out
  {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, locale: "ar-AE" });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await capture(page, "header-tablet-logged-out.png");
    results.push({ case: "tablet-logged-out", ...(await checkAddListingButton(page)) });
    await ctx.close();
  }

  // Mobile logged out - closed menu
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: "ar-AE" });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/search`, { waitUntil: "networkidle" });
    await capture(page, "header-mobile-logged-out.png");
    await ctx.close();
  }

  // Mobile logged out - open menu
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: "ar-AE" });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/search`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "القائمة" }).click();
    await page.waitForTimeout(300);
    await capture(page, "header-mobile-menu-open.png");
    const btn = page.locator('a[href="/listings/new"]').filter({ hasText: "أضف إعلانك" }).last();
    const box = await btn.boundingBox();
    const text = await btn.innerText();
    results.push({ case: "mobile-menu-button", text: text.trim(), box });
    await ctx.close();
  }

  // Focus ring check
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/search`, { waitUntil: "networkidle" });
    const btn = page.locator('a[href="/listings/new"]').filter({ hasText: "أضف إعلانك" }).first();
    await btn.focus();
    await capture(page, "header-desktop-focus.png");
    await ctx.close();
  }

  await browser.close();

  const report = {
    results,
    pass: results.every((r) => !r.clipped && (r.text?.includes("أضف إعلانك") ?? true)),
  };
  fs.writeFileSync(path.join(OUT, "header-qa-metrics.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})();
