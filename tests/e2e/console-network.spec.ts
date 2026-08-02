import { test, expect, loginAsAdmin } from './fixtures/qa';

const routes = ['/', '/categories', '/listings'];

test.describe('Console and network monitoring', () => {
  for (const route of routes) {
    test(`${route} opens successfully`, async ({ monitoredPage }) => {
      const response = await monitoredPage.goto(route, { waitUntil: 'networkidle' });
      expect(response).not.toBeNull();
      expect(response!.status()).toBeLessThan(500);
      await expect(monitoredPage.locator('body')).toBeVisible();
    });
  }

  test('admin dashboard opens with monitoring enabled', async ({ monitoredPage }) => {
    await loginAsAdmin(monitoredPage);
    await expect(monitoredPage.locator('body')).toBeVisible();
  });
});
