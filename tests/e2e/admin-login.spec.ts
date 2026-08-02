import { test, expect, loginAsAdmin } from './fixtures/qa';

test.describe('Admin authentication', () => {
  test('admin login succeeds with QA credentials', async ({ monitoredPage }) => {
    await loginAsAdmin(monitoredPage);
    await expect(monitoredPage).toHaveURL(/\/admin(?:\/|$)/i);
  });

  test('invalid credentials do not grant admin access', async ({ monitoredPage }) => {
    await monitoredPage.goto('/admin/');

    const emailInput = monitoredPage.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = monitoredPage.locator('input[type="password"], input[name="password"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await emailInput.fill('qa-invalid@example.invalid');
    await passwordInput.fill('invalid-password');
    await monitoredPage.locator('button[type="submit"]').first().click();

    await expect(monitoredPage).not.toHaveURL(/\/admin(?:\/|$)/i);
  });
});
