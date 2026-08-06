import { test, expect } from './fixtures/qa';

const routes = ['/', '/categories', '/listings', '/admin/'];

test.describe('Responsive layout', () => {
  for (const route of routes) {
    test(`${route} has no horizontal page overflow`, async ({ monitoredPage }) => {
      await monitoredPage.goto(route, { waitUntil: 'domcontentloaded' });
      const overflow = await monitoredPage.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth - root.clientWidth;
      });
      expect(overflow, `${route} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(2);
      await expect(monitoredPage.locator('body')).toBeVisible();
    });
  }
});
