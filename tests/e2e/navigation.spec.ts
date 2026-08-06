import { test, expect, loginAsAdmin } from './fixtures/qa';
import { loadDiscoveredRoutes } from './qa-routes';

test.describe('Navigation smoke tests', () => {
  test('all discovered public routes load successfully', async ({ monitoredPage }) => {
    const { publicRoutes } = await loadDiscoveredRoutes();
    expect(publicRoutes.length, 'No public routes were discovered').toBeGreaterThan(0);

    for (const route of publicRoutes) {
      const response = await monitoredPage.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response, `No response received for ${route}`).not.toBeNull();
      expect(response!.status(), `${route} returned ${response!.status()}`).toBeLessThan(400);
      await expect(monitoredPage.locator('body')).toBeVisible();
    }
  });

  test('discovered admin routes load after authentication', async ({ monitoredPage }) => {
    const { adminRoutes } = await loadDiscoveredRoutes();
    test.skip(adminRoutes.length === 0, 'No static admin routes were discovered.');

    await loginAsAdmin(monitoredPage);

    for (const route of adminRoutes) {
      const response = await monitoredPage.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response, `No response received for ${route}`).not.toBeNull();
      expect(response!.status(), `${route} returned ${response!.status()}`).toBeLessThan(400);
      await expect(monitoredPage.locator('body')).toBeVisible();
      await expect(monitoredPage.locator('input[type="password"]')).toHaveCount(0);
    }
  });
});
