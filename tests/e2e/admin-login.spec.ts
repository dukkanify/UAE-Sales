import { test, expect, loginAsAdmin } from './fixtures/qa';

test.describe('Admin authentication', () => {
  test('admin login succeeds with QA credentials', async ({ monitoredPage }) => {
    await loginAsAdmin(monitoredPage);
    await expect(monitoredPage.locator('input[type="password"]')).toHaveCount(0);
    await expect(monitoredPage.locator('body')).toBeVisible();
  });

  test('invalid credentials do not create an authenticated admin session', async ({ monitoredPage }) => {
    await monitoredPage.goto('/admin/', { waitUntil: 'domcontentloaded' });

    const emailInput = monitoredPage.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = monitoredPage.locator('input[type="password"], input[name="password"]').first();
    const submit = monitoredPage.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submit).toBeVisible();

    await emailInput.fill('qa-invalid@example.invalid');
    await passwordInput.fill('invalid-password');
    await submit.click();

    await expect(passwordInput).toBeVisible();
    await expect(monitoredPage.locator('input[type="password"]')).toHaveCount(1);

    const cookies = await monitoredPage.context().cookies();
    const adminSessionCookies = cookies.filter(cookie => /session|auth|token/i.test(cookie.name));
    expect(adminSessionCookies, 'Invalid login created an authentication cookie').toHaveLength(0);
  });
});
