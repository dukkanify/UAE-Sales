import { promises as fs } from 'node:fs';
import path from 'node:path';

const reportDir = path.resolve('qa-report');
await fs.mkdir(reportDir, { recursive: true });

const exists = async file => {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
};

const readText = async file => (await exists(file) ? fs.readFile(file, 'utf8') : '');
const listJsonFiles = async dir => {
  try {
    return (await fs.readdir(dir))
      .filter(name => name.endsWith('.json'))
      .map(name => path.join(dir, name));
  } catch {
    return [];
  }
};

const junitPath = path.resolve('test-results/junit.xml');
const junit = await readText(junitPath);
const testSuites = Number(junit.match(/tests="(\d+)"/)?.[1] ?? 0);
const failures = Number(junit.match(/failures="(\d+)"/)?.[1] ?? 0);
const skipped = Number(junit.match(/skipped="(\d+)"/)?.[1] ?? 0);

const lighthouseFiles = await listJsonFiles(path.resolve('.lighthouseci'));
const lighthouse = [];

for (const file of lighthouseFiles) {
  try {
    const data = JSON.parse(await fs.readFile(file, 'utf8'));
    if (!data.categories || !data.finalUrl) continue;
    lighthouse.push({
      url: data.finalUrl,
      performance: Math.round((data.categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((data.categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((data.categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((data.categories.seo?.score ?? 0) * 100),
    });
  } catch {
    // Ignore non-Lighthouse JSON files.
  }
}

const severity = failures > 0 ? 'High' : lighthouse.some(item => item.accessibility < 85) ? 'Medium' : 'None';
const generatedAt = new Date().toISOString();

const summary = {
  generatedAt,
  playwright: { tests: testSuites, failures, skipped },
  lighthouse,
  overallSeverity: severity,
};

await fs.writeFile(path.join(reportDir, 'qa-summary.json'), JSON.stringify(summary, null, 2));

const rows = lighthouse.length
  ? lighthouse.map(item => `| ${item.url} | ${item.performance} | ${item.accessibility} | ${item.bestPractices} | ${item.seo} |`).join('\n')
  : '| No Lighthouse reports found | - | - | - | - |';

const markdown = `# Sooqna Frontend QA Report

Generated: ${generatedAt}

## Executive Summary

- Overall severity: **${severity}**
- Playwright tests: **${testSuites}**
- Failures: **${failures}**
- Skipped: **${skipped}**

## Lighthouse Scores

| URL | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
${rows}

## Evidence

Review the accompanying artifacts for HTML reports, JUnit XML, screenshots, videos, traces, Console errors, failed requests, and Lighthouse JSON/HTML files.
`;

await fs.writeFile(path.join(reportDir, 'qa-report.md'), markdown);
console.log(markdown);
