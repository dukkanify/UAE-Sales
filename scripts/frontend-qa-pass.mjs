#!/usr/bin/env node
/**
 * Frontend QA pass — navigates key routes, captures screenshots,
 * console errors, and failed network requests.
 *
 * Usage:
 *   node scripts/frontend-qa-pass.mjs [baseUrl]
 * Default baseUrl: http://127.0.0.1:3000
 */
import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const OUT = path.resolve("artifacts/qa/2026-08-03");
const stamp = new Date().toISOString();

const PUBLIC_ROUTES = [
  "/",
  "/categories",
  "/categories/cars",
  "/search",
  "/featured",
  "/listings/mercedes-amg-g63-2024",
  "/login",
  "/register",
  "/escrow",
  "/wallet",
  "/support",
  "/disputes/new",
  "/listings/new",
  "/profile",
  "/dashboard/listings",
  "/chat",
  "/checkout",
  "/orders",
  "/admin",
];

const ADMIN_ROUTES = [
  "/admin",
  "/admin/analytics",
  "/admin/listings",
  "/admin/users",
  "/admin/orders",
  "/admin/settings",
];

function slug(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "__");
}

function ensureDirs() {
  for (const dir of ["desktop", "mobile", "console", "lighthouse", "fixes"]) {
    fs.mkdirSync(path.join(OUT, dir), { recursive: true });
  }
}

async function probeRoute(page, route, viewportLabel, findings) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  const onConsole = (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  };
  const onPageError = (err) => pageErrors.push(String(err));
  const onRequestFailed = (req) => {
    failedRequests.push({
      url: req.url(),
      method: req.method(),
      error: req.failure()?.errorText || "failed",
    });
  };
  const onResponse = (res) => {
    if (res.status() >= 400) {
      failedRequests.push({
        url: res.url(),
        method: res.request().method(),
        error: `HTTP ${res.status()}`,
      });
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  const url = new URL(route, BASE).toString();
  let status = null;
  let finalUrl = url;
  let title = "";
  let loadMs = null;
  let ok = true;
  let error = null;

  const started = Date.now();
  try {
    const res = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    status = res?.status() ?? null;
    finalUrl = page.url();
    title = await page.title().catch(() => "");
    await page.waitForTimeout(1200);
    // Give lazy images a chance to decode without treating HMR noise as failures.
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {});
    loadMs = Date.now() - started;

    const shotPath = path.join(
      OUT,
      viewportLabel,
      `${slug(route)}.png`,
    );
    await page.screenshot({ path: shotPath, fullPage: true });

    const bodyText = await page.locator("body").innerText().catch(() => "");
    const looks404 =
      /404|هذه الصفحة غير موجودة|Page Not Found/i.test(bodyText) ||
      status === 404;
    const looksComingSoon = /قريبًا|Coming Soon|قريباً/i.test(bodyText);
    const looksErrorBoundary =
      /Application error|Unhandled Runtime Error|Hydration failed|Recoverable Error/i.test(
        bodyText,
      ) ||
      consoleErrors.some((t) => /Hydration failed|Minified React error/i.test(t));

    if (looks404) {
      findings.push({
        page: route,
        viewport: viewportLabel,
        issue: "الصفحة تعيد 404 أو محتوى غير موجود",
        severity: "High",
        evidence: `status=${status} final=${finalUrl}`,
        screenshot: shotPath,
        console: consoleErrors.slice(0, 8),
        network: failedRequests.slice(0, 8),
        componentHint: `app${route === "/" ? "/page.tsx" : `${route}/page.tsx`}`,
      });
      ok = false;
    }

    if (looksErrorBoundary || pageErrors.length) {
      findings.push({
        page: route,
        viewport: viewportLabel,
        issue: "خطأ تشغيل / hydration في الواجهة",
        severity: "Critical",
        evidence: pageErrors[0] || consoleErrors.find((t) => /Hydration|Error/i.test(t)) || "error boundary",
        screenshot: shotPath,
        console: [...pageErrors, ...consoleErrors].slice(0, 12),
        network: failedRequests.slice(0, 8),
        componentHint: "Check page client components + MarketHeader / layout",
      });
      ok = false;
    }

    if (looksComingSoon) {
      findings.push({
        page: route,
        viewport: viewportLabel,
        issue: "صفحة Coming Soon — مسار معلن لكن غير مكتمل",
        severity: "Medium",
        evidence: "Coming Soon content detected",
        screenshot: shotPath,
        console: consoleErrors.slice(0, 5),
        network: failedRequests.slice(0, 5),
        componentHint: "shared ComingSoonPage usage",
      });
    }

    // Broken images: only count images that finished loading and failed
    // (ignore lazy/not-yet-loaded to reduce false positives).
    const brokenImages = await page.evaluate(() => {
      return Array.from(document.images)
        .filter(
          (img) =>
            img.complete &&
            img.naturalWidth === 0 &&
            Boolean(img.currentSrc || img.src),
        )
        .map((img) => img.currentSrc || img.src)
        .slice(0, 6);
    });
    if (brokenImages.length) {
      findings.push({
        page: route,
        viewport: viewportLabel,
        issue: `صور مكسورة (${brokenImages.length})`,
        severity: "High",
        evidence: brokenImages.join(" | "),
        screenshot: shotPath,
        console: consoleErrors.filter((t) => !/webpack-hmr|WebSocket/i.test(t)).slice(0, 5),
        network: failedRequests.slice(0, 8),
        componentHint: "shared/components/AppImage.tsx or listing image map",
      });
    }

    // Obvious horizontal overflow on mobile
    if (viewportLabel === "mobile") {
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
        };
      });
      if (overflow.scrollWidth > overflow.clientWidth + 8) {
        findings.push({
          page: route,
          viewport: viewportLabel,
          issue: "Overflow أفقي على الموبايل (تصميم ينكسر)",
          severity: "Medium",
          evidence: `scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`,
          screenshot: shotPath,
          console: [],
          network: [],
          componentHint: "page layout / globals.css mobile rules",
        });
      }
    }

    const meaningfulNetwork = failedRequests.filter(
      (r) =>
        !r.url.includes("_next/static") &&
        !/favicon|manifest/.test(r.url) &&
        !/ERR_ABORTED/.test(r.error || ""),
    );
    if (meaningfulNetwork.length >= 3) {
      findings.push({
        page: route,
        viewport: viewportLabel,
        issue: "طلبات شبكة فاشلة متعددة",
        severity: "Medium",
        evidence: meaningfulNetwork
          .slice(0, 5)
          .map((r) => `${r.error} ${r.url}`)
          .join(" || "),
        screenshot: shotPath,
        console: consoleErrors.slice(0, 5),
        network: meaningfulNetwork.slice(0, 10),
        componentHint: "API route or remote asset URL",
      });
    }

    return {
      route,
      viewport: viewportLabel,
      status,
      finalUrl,
      title,
      loadMs,
      ok,
      error,
      consoleErrors: consoleErrors.slice(0, 20),
      pageErrors: pageErrors.slice(0, 10),
      failedRequests: failedRequests.slice(0, 20),
      screenshot: path.join(viewportLabel, `${slug(route)}.png`),
    };
  } catch (err) {
    ok = false;
    error = String(err);
    findings.push({
      page: route,
      viewport: viewportLabel,
      issue: "فشل تحميل الصفحة / اتصال",
      severity: "Critical",
      evidence: error,
      screenshot: null,
      console: consoleErrors,
      network: failedRequests,
      componentHint: "server / routing",
    });
    return {
      route,
      viewport: viewportLabel,
      status,
      finalUrl,
      title,
      loadMs: Date.now() - started,
      ok,
      error,
      consoleErrors,
      pageErrors,
      failedRequests,
      screenshot: null,
    };
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("requestfailed", onRequestFailed);
    page.off("response", onResponse);
  }
}

async function tryAdminLogin(page) {
  await page.goto(new URL("/login?next=/admin", BASE).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.waitForTimeout(800);

  await page.screenshot({
    path: path.join(OUT, "fixes", "admin-login-before.png"),
    fullPage: true,
  });

  // Prefer API login (sets httpOnly session cookie) so QA can cover /admin
  // even when client hydration is delayed in headless/dev.
  const apiRes = await page.request.post(new URL("/api/auth/login/password", BASE).toString(), {
    data: {
      email: "admin@sooqna.demo",
      password: "Admin@123",
      next: "/admin",
    },
  });
  const apiOk = apiRes.ok();
  const apiBody = await apiRes.json().catch(() => ({}));

  await page.goto(new URL("/admin", BASE).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.waitForTimeout(1000);

  const url = page.url();
  const ok = apiOk && /\/admin(\/|$)/.test(new URL(url).pathname);
  await page.screenshot({
    path: path.join(OUT, "desktop", "admin-login-result.png"),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(OUT, "fixes", "admin-login-after.png"),
    fullPage: true,
  });
  return {
    ok,
    reason: ok
      ? "reached /admin via password API session cookie"
      : `api=${apiRes.status()} body=${JSON.stringify(apiBody).slice(0, 160)} ended at ${url}`,
  };
}

function severityRank(s) {
  return { Critical: 0, High: 1, Medium: 2, Low: 3 }[s] ?? 9;
}

function toMarkdown(report) {
  const lines = [];
  lines.push(`# Frontend QA Report — Sooqna`);
  lines.push("");
  lines.push(`- **Base URL:** ${report.baseUrl}`);
  lines.push(`- **Generated:** ${report.generatedAt}`);
  lines.push(`- **Routes probed:** ${report.results.length}`);
  lines.push(`- **Findings:** ${report.findings.length}`);
  lines.push("");
  lines.push(`## Summary table`);
  lines.push("");
  lines.push(`| الصفحة | المشكلة | مستوى الخطورة | دليل |`);
  lines.push(`|--------|---------|---------------|------|`);
  const sorted = [...report.findings].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity),
  );
  for (const f of sorted) {
    const shot = f.screenshot
      ? path.relative(OUT, f.screenshot).replaceAll("\\", "/")
      : "—";
    const consoleHint = f.console?.[0]
      ? `Console: ${String(f.console[0]).slice(0, 80).replaceAll("|", "/")}`
      : "";
    lines.push(
      `| \`${f.page}\` (${f.viewport}) | ${f.issue} | **${f.severity}** | ${shot}${consoleHint ? ` · ${consoleHint}` : ""} |`,
    );
  }
  if (!sorted.length) {
    lines.push(`| — | لا توجد مشاكل مكتشفة تلقائيًا | — | — |`);
  }
  lines.push("");
  lines.push(`## Detailed findings`);
  lines.push("");
  sorted.forEach((f, i) => {
    lines.push(`### ${i + 1}. [${f.severity}] ${f.page} — ${f.issue}`);
    lines.push("");
    lines.push(`- **Viewport:** ${f.viewport}`);
    lines.push(`- **Evidence:** ${f.evidence}`);
    lines.push(`- **Expected component:** ${f.componentHint}`);
    if (f.screenshot) {
      lines.push(
        `- **Screenshot:** \`${path.relative(OUT, f.screenshot).replaceAll("\\", "/")}\``,
      );
    }
    if (f.console?.length) {
      lines.push(`- **Console:**`);
      lines.push("```");
      lines.push(f.console.slice(0, 8).join("\n"));
      lines.push("```");
    }
    if (f.network?.length) {
      lines.push(`- **Network:**`);
      lines.push("```");
      lines.push(
        f.network
          .slice(0, 8)
          .map((n) => `${n.error} ${n.method || ""} ${n.url}`)
          .join("\n"),
      );
      lines.push("```");
    }
    lines.push("");
  });

  lines.push(`## Route results`);
  lines.push("");
  lines.push(`| Route | Viewport | Status | Load ms | OK | Final URL |`);
  lines.push(`|-------|----------|--------|---------|----|-----------|`);
  for (const r of report.results) {
    lines.push(
      `| \`${r.route}\` | ${r.viewport} | ${r.status ?? "—"} | ${r.loadMs ?? "—"} | ${r.ok ? "✅" : "❌"} | ${r.finalUrl} |`,
    );
  }
  lines.push("");
  lines.push(`## Admin login`);
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(report.adminLogin, null, 2));
  lines.push("```");
  lines.push("");
  return lines.join("\n");
}

async function runViewport(browser, label, contextOptions, routes, findings) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const results = [];
  for (const route of routes) {
    process.stdout.write(`  [${label}] ${route} ... `);
    const result = await probeRoute(page, route, label, findings);
    results.push(result);
    console.log(result.ok ? "ok" : "ISSUE");
  }
  await context.close();
  return results;
}

async function main() {
  ensureDirs();
  console.log(`QA base: ${BASE}`);
  console.log(`Output: ${OUT}`);

  const browser = await chromium.launch({ headless: true });
  const findings = [];

  const desktopResults = await runViewport(
    browser,
    "desktop",
    { viewport: { width: 1440, height: 900 }, locale: "ar-AE" },
    PUBLIC_ROUTES,
    findings,
  );

  const mobileResults = await runViewport(
    browser,
    "mobile",
    {
      ...devices["iPhone 13"],
      locale: "ar-AE",
    },
    ["/", "/search", "/listings/mercedes-amg-g63-2024", "/login", "/categories", "/admin"],
    findings,
  );

  // Admin login + admin pages on desktop
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "ar-AE",
  });
  const adminPage = await adminContext.newPage();
  console.log("  [admin] login ...");
  const adminLogin = await tryAdminLogin(adminPage);
  console.log(adminLogin.ok ? "ok" : `fail: ${adminLogin.reason}`);

  const adminResults = [];
  if (adminLogin.ok) {
    for (const route of ADMIN_ROUTES) {
      process.stdout.write(`  [admin] ${route} ... `);
      const result = await probeRoute(adminPage, route, "desktop", findings);
      adminResults.push(result);
      console.log(result.ok ? "ok" : "ISSUE");
    }
  } else {
    findings.push({
      page: "/admin",
      viewport: "desktop",
      issue: "تعذر تسجيل دخول الأدمن التجريبي — لوحة التحكم غير قابلة للاختبار",
      severity: "High",
      evidence: adminLogin.reason,
      screenshot: path.join(OUT, "desktop", "admin-login-result.png"),
      console: [],
      network: [],
      componentHint: "features/auth + proxy.ts admin gate + demo accounts",
    });
  }
  await adminContext.close();
  await browser.close();

  const report = {
    baseUrl: BASE,
    generatedAt: stamp,
    adminLogin,
    findings,
    results: [...desktopResults, ...mobileResults, ...adminResults],
  };

  fs.writeFileSync(
    path.join(OUT, "report.json"),
    JSON.stringify(report, null, 2),
  );
  fs.writeFileSync(path.join(OUT, "REPORT.md"), toMarkdown(report));
  fs.writeFileSync(
    path.join(OUT, "console", "console-summary.json"),
    JSON.stringify(
      report.results.map((r) => ({
        route: r.route,
        viewport: r.viewport,
        consoleErrors: r.consoleErrors,
        pageErrors: r.pageErrors,
        failedRequests: r.failedRequests,
      })),
      null,
      2,
    ),
  );

  console.log(`\nFindings: ${findings.length}`);
  console.log(`Wrote ${path.join(OUT, "REPORT.md")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
