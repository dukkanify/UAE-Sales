import { expect, test as base, type Page, type TestInfo } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';

type QAFixtures = {
  monitoredPage: Page;
};

async function attachText(testInfo: TestInfo, name: string, lines: string[]) {
  if (lines.length === 0) return;
  const filePath = path.join(testInfo.outputDir, `${name}.txt`);
  await fs.mkdir(testInfo.outputDir, { recursive: true });
  await fs.writeFile(filePath, lines.join('\n'), 'utf8');
  await testInfo.attach(name, { path: filePath, contentType: 'text/plain' });
}

export const test = base.extend<QAFixtures>({
  monitoredPage: async ({ page }, use, testInfo) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    const badResponses: string[] = [];

    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    page.on('pageerror', error => {
      consoleErrors.push(`PAGE_ERROR: ${error.message}`);
    });

    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText ?? 'unknown'}`);
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        badResponses.push(`${response.status()} ${response.request().method()} ${response.url()}`);
      }
    });

    await use(page);

    await attachText(testInfo, 'console-errors', consoleErrors);
    await attachText(testInfo, 'failed-requests', failedRequests);
    await attachText(testInfo, 'http-errors', badResponses);
  },
});

export async function loginAsAdmin(page: Page) {
  const email = process.env.QA_ADMIN_EMAIL;
  const password = process.env.QA_ADMIN_PASSWORD;
  test.skip(!email || !password, 'QA_ADMIN_EMAIL and QA_ADMIN_PASSWORD secrets are required.');

  await page.goto('/admin/');

  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await emailInput.fill(email!);
  await passwordInput.fill(password!);

  const submit = page.locator('button[type="submit"]').first();
  await expect(submit).toBeVisible();
  await submit.click();

  await page.waitForLoadState('networkidle');
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/i);
}

export { expect };
