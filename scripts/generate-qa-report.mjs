import { promises as fs } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const reportDir = path.resolve('qa-report');
const resultsDir = path.resolve('test-results');
const artifactsDir = path.join(resultsDir, 'artifacts');
const playwrightJsonPath = path.join(resultsDir, 'results.json');
const lighthouseDir = path.resolve('.lighthouseci');

await fs.mkdir(reportDir, { recursive: true });

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function walk(dir) {
  if (!(await exists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else files.push(fullPath);
  }
  return files;
}

function relative(file) {
  return file ? path.relative(cwd, file).replaceAll(path.sep, '/') : null;
}

function markdownEscape(value = '') {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function normalizeError(error) {
  if (!error) return 'Unknown test failure';
  return String(error.message ?? error.value ?? error.stack ?? error).trim();
}

function inferRoute(title, errorText) {
  const text = `${title} ${errorText}`;
  const route = text.match(/(?:route\s+|\b)(\/(?:admin|api)?[^\s"'`)>,]*)/i)?.[1];
  return route ?? 'Unknown';
}

function inferSeverity(title, errorText) {
  const text = `${title} ${errorText}`.toLowerCase();
  if (/security|rbac|unauthorized|authentication|admin session|401|403/.test(text)) return 'Critical';
  if (/500|server error|request failed|login succeeds|navigation|api smoke/.test(text)) return 'High';
  if (/visual|responsive|accessibility|console|network|404/.test(text)) return 'Medium';
  return 'Low';
}

function inferExpectedFile(specFile, route) {
  if (specFile) return relative(specFile);
  if (route.startsWith('/api/')) return 'app/api/**/route.ts or src/app/api/**/route.ts';
  if (route.startsWith('/admin')) return 'app/admin/**/page.tsx or src/app/admin/**/page.tsx';
  return 'app/**/page.tsx or src/app/**/page.tsx';
}

function inferSuggestedFix(title, errorText) {
  const text = `${title} ${errorText}`.toLowerCase();
  if (/404|not found/.test(text)) return 'Verify the route exists in the deployed build and correct navigation links or route configuration.';
  if (/401|403|unauthorized|rbac/.test(text)) return 'Review middleware, session validation, and role checks. Ensure anonymous users are denied and authorized roles retain access.';
  if (/login|authentication|session/.test(text)) return 'Review the login form selectors, authentication response handling, cookies, and post-login protected-state rendering.';
  if (/visual|screenshot/.test(text)) return 'Review the image diff, confirm whether the UI change is intentional, then fix the component or approve a new baseline.';
  if (/responsive|overflow/.test(text)) return 'Inspect fixed widths, min-width values, grid breakpoints, and overflowing children at the failing viewport.';
  if (/accessibility|accessible|label|alt/.test(text)) return 'Add missing accessible names, form labels, alt text, language/direction attributes, or correct semantic markup.';
  if (/console|page_error/.test(text)) return 'Trace the first application stack frame, guard null or undefined state, and remove unexpected runtime errors.';
  if (/network|request failed|500/.test(text)) return 'Inspect the failed request and server logs, validate the endpoint, payload, environment variables, and upstream service availability.';
  if (/performance|budget|load/.test(text)) return 'Profile the page, optimize large assets and client bundles, reduce blocking work, and defer non-critical resources.';
  return 'Reproduce using the attached Playwright trace, identify the first failing assertion or request, then correct the affected component or endpoint.';
}

function collectSpecs(suites, parents = [], output = []) {
  for (const suite of suites ?? []) {
    const nextParents = suite.title ? [...parents, suite.title] : parents;
    for (const spec of suite.specs ?? []) output.push({ ...spec, parents: nextParents, file: suite.file });
    collectSpecs(suite.suites, nextParents, output);
  }
  return output;
}

const playwright = await readJson(playwrightJsonPath, { suites: [], stats: {} });
const artifactFiles = await walk(artifactsDir);
const allResultFiles = await walk(resultsDir);
const specs = collectSpecs(playwright.suites);
const issues = [];

for (const spec of specs) {
  const title = [...spec.parents, spec.title].filter(Boolean).join(' > ');
  for (const test of spec.tests ?? []) {
    for (const result of test.results ?? []) {
      if (result.status === 'passed' || result.status === 'skipped') continue;

      const errorText = (result.errors ?? []).map(normalizeError).filter(Boolean).join('\n\n') || normalizeError(result.error);
      const attachments = (result.attachments ?? []).map(item => ({
        name: item.name,
        contentType: item.contentType,
        path: item.path ? relative(path.resolve(item.path)) : null,
      }));

      const matchingFiles = [...artifactFiles, ...allResultFiles]
        .filter(file => {
          const lower = file.toLowerCase();
          return lower.endsWith('.png') || lower.endsWith('.webm') || lower.endsWith('.zip') || lower.endsWith('.txt');
        })
        .map(relative);

      const route = inferRoute(title, errorText);
      const evidence = [...new Set([
        ...attachments.map(item => item.path).filter(Boolean),
        ...matchingFiles.filter(file => file.includes(test.projectName ?? '') || file.includes(spec.title.replaceAll(' ', '-'))),
      ])];

      issues.push({
        page: route,
        problem: title,
        severity: inferSeverity(title, errorText),
        project: test.projectName ?? 'Unknown',
        status: result.status,
        durationMs: result.duration ?? 0,
        error: errorText,
        stepsToReproduce: [
          `Open ${process.env.BASE_URL ?? 'the configured BASE_URL'}${route === 'Unknown' ? '' : route}.`,
          `Run the Playwright project: ${test.projectName ?? 'desktop-chromium'}.`,
          `Execute the test: ${title}.`,
          'Observe the failing assertion, Console/Network evidence, screenshot, video, or trace.',
        ],
        expectedFile: inferExpectedFile(spec.file, route),
        suggestedFix: inferSuggestedFix(title, errorText),
        evidence,
      });
    }
  }
}

const evidenceFiles = allResultFiles.filter(file => /console-errors|failed-requests|http-errors/i.test(path.basename(file)));
for (const file of evidenceFiles) {
  const content = (await fs.readFile(file, 'utf8')).trim();
  if (!content) continue;
  const kind = path.basename(file, path.extname(file));
  issues.push({
    page: 'See evidence path',
    problem: kind.replaceAll('-', ' '),
    severity: /http-errors|failed-requests/.test(kind) ? 'High' : 'Medium',
    project: 'Browser monitoring',
    status: 'observed',
    durationMs: 0,
    error: content,
    stepsToReproduce: [
      'Open the page covered by the parent Playwright test.',
      'Repeat the recorded user flow.',
      `Inspect ${relative(file)} for the captured browser evidence.`,
    ],
    expectedFile: 'Affected page component, API route, or shared client utility',
    suggestedFix: inferSuggestedFix(kind, content),
    evidence: [relative(file)],
  });
}

const lighthouse = [];
for (const file of await walk(lighthouseDir)) {
  if (!file.endsWith('.json')) continue;
  const data = await readJson(file);
  if (!data?.categories || !data.finalUrl) continue;
  lighthouse.push({
    url: data.finalUrl,
    performance: Math.round((data.categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((data.categories.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((data.categories['best-practices']?.score ?? 0) * 100),
    seo: Math.round((data.categories.seo?.score ?? 0) * 100),
  });
}

for (const audit of lighthouse) {
  const weak = [
    ['Performance', audit.performance, 70],
    ['Accessibility', audit.accessibility, 85],
    ['Best Practices', audit.bestPractices, 80],
    ['SEO', audit.seo, 80],
  ].filter(([, score, minimum]) => score < minimum);

  for (const [category, score, minimum] of weak) {
    issues.push({
      page: audit.url,
      problem: `${category} score ${score}, below target ${minimum}`,
      severity: category === 'Accessibility' ? 'High' : 'Medium',
      project: 'Lighthouse',
      status: 'below-budget',
      durationMs: 0,
      error: `${category} score is ${score}.`,
      stepsToReproduce: [`Run Lighthouse CI for ${audit.url}.`, `Review the ${category} audits below the configured threshold.`],
      expectedFile: 'Affected route components, layout, styles, assets, or metadata',
      suggestedFix: inferSuggestedFix(category, `${score} below ${minimum}`),
      evidence: ['.lighthouseci/'],
    });
  }
}

const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
issues.sort((a, b) => (severityOrder[b.severity] ?? 0) - (severityOrder[a.severity] ?? 0));
const generatedAt = new Date().toISOString();
const stats = playwright.stats ?? {};
const summary = {
  generatedAt,
  baseUrl: process.env.BASE_URL ?? 'https://sooqna.site',
  playwright: {
    expected: stats.expected ?? 0,
    unexpected: stats.unexpected ?? issues.filter(issue => issue.status === 'failed').length,
    flaky: stats.flaky ?? 0,
    skipped: stats.skipped ?? 0,
    durationMs: stats.duration ?? 0,
  },
  issueCounts: {
    total: issues.length,
    critical: issues.filter(issue => issue.severity === 'Critical').length,
    high: issues.filter(issue => issue.severity === 'High').length,
    medium: issues.filter(issue => issue.severity === 'Medium').length,
    low: issues.filter(issue => issue.severity === 'Low').length,
  },
  lighthouse,
  issues,
};

await fs.writeFile(path.join(reportDir, 'qa-summary.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(reportDir, 'qa-issues.json'), JSON.stringify(issues, null, 2));

const issueRows = issues.length
  ? issues.map((issue, index) => {
      const evidence = issue.evidence.length ? issue.evidence.map(file => `\`${file}\``).join('<br>') : 'See Playwright report';
      return `| ${index + 1} | ${markdownEscape(issue.page)} | ${markdownEscape(issue.problem)} | **${issue.severity}** | ${markdownEscape(issue.expectedFile)} | ${evidence} |`;
    }).join('\n')
  : '| - | - | No issues detected | None | - | - |';

const details = issues.length
  ? issues.map((issue, index) => `## Issue ${index + 1}: ${issue.problem}\n\n- **Page:** ${issue.page}\n- **Severity:** ${issue.severity}\n- **Project:** ${issue.project}\n- **Status:** ${issue.status}\n- **Expected file/component:** ${issue.expectedFile}\n- **Suggested fix:** ${issue.suggestedFix}\n\n### Steps to Reproduce\n\n${issue.stepsToReproduce.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join('\n')}\n\n### Error / Console / Network Evidence\n\n\`\`\`text\n${issue.error.slice(0, 4000)}\n\`\`\`\n\n### Attachments\n\n${issue.evidence.length ? issue.evidence.map(file => `- \`${file}\``).join('\n') : '- Review the Playwright HTML report and test artifacts.'}`).join('\n\n---\n\n')
  : 'No failed tests or captured browser errors were found.';

const lighthouseRows = lighthouse.length
  ? lighthouse.map(item => `| ${item.url} | ${item.performance} | ${item.accessibility} | ${item.bestPractices} | ${item.seo} |`).join('\n')
  : '| No Lighthouse reports found | - | - | - | - |';

const markdown = `# Sooqna Frontend QA Report\n\nGenerated: ${generatedAt}\n\n## Executive Summary\n\n- Total detected issues: **${issues.length}**\n- Critical: **${summary.issueCounts.critical}**\n- High: **${summary.issueCounts.high}**\n- Medium: **${summary.issueCounts.medium}**\n- Low: **${summary.issueCounts.low}**\n- Expected Playwright tests: **${summary.playwright.expected}**\n- Unexpected failures: **${summary.playwright.unexpected}**\n- Flaky: **${summary.playwright.flaky}**\n- Skipped: **${summary.playwright.skipped}**\n\n## Issue Register\n\n| # | Page | Problem | Severity | Expected File / Component | Evidence |\n|---:|---|---|---|---|---|\n${issueRows}\n\n## Lighthouse Scores\n\n| URL | Performance | Accessibility | Best Practices | SEO |\n|---|---:|---:|---:|---:|\n${lighthouseRows}\n\n# Detailed Findings\n\n${details}\n`;

await fs.writeFile(path.join(reportDir, 'qa-report.md'), markdown);
console.log(markdown);
