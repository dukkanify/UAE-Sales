import { test, expect, loginAsAdmin } from './fixtures/qa';

const publicRoutes = ['/', '/categories', '/listings'];

test.describe('Navigation smoke tests', () => {
  for (const route of publicRoutes) {
    test(`public route ${route} loads without server error`, async ({ monitoredPage }) => {
      const response = await monitoredPage.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response, `No response received for ${route}`).not.toBeNull();
      expect(response!.status(), `${route} returned ${response!.status()}`).toBeLessThan(500);
      await expect(monitoredPage.locator('body')).toBeVisible();
    });
  }

  test('admin navigation links open without destructive actions', async ({ monitoredPage }) => {
    await loginAsAdmin(monitoredPage);

    const links = monitoredPage.locator('a[href^="/admin"]:visible');
    const count = Math.min(await links.count(), 20);
    const hrefs = new Set<string>();

    for (let index = 0; index < count; index += 1) {
      const href = await links.nth(index).getAttribute('href');
      if (href && !hrefs.has(href)) hrefs.add(href);
    }

    expect(hrefs.size, 'No admin navigation links were discovered').toBeGreaterThan(0);

    for (const href of hrefs) {
      const response = await monitoredPage.goto(href, { waitUntil: 'domcontentloaded' });
      expect(response, `No response received for ${href}`).not.toBeNull();
      expect(response!.status(), `${href} returned ${response!.status()}`).toBeLessThan(500);
      await expect(monitoredPage.locator('body')).toBeVisible();
    }
  });
});
