import { test, expect, loginAsAdmin } from './fixtures/qa';
import { adminRoutes } from './qa-routes';

test.describe('Role-based access control', () => {
  for (const route of adminRoutes) {
    test(`guest cannot access ${route}`, async ({ monitoredPage }) => {
      await monitoredPage.context().clearCookies();
      await monitoredPage.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(monitoredPage).toHaveURL(/\/login(?:\?|$)|\/unauthorized(?:\?|$)/i);
    });
  }

  test('admin can access protected admin routes', async ({ monitoredPage }) => {
    await loginAsAdmin(monitoredPage);

    for (const route of adminRoutes) {
      const response = await monitoredPage.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response).not.toBeNull();
      expect(response!.status()).toBeLessThan(500);
      await expect(monitoredPage).not.toHaveURL(/\/login(?:\?|$)|\/unauthorized(?:\?|$)/i);
    }
  });
});
