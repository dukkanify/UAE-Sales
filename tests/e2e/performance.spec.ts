import { test, expect } from './fixtures/qa';

const routes = ['/', '/categories', '/listings'];

test.describe('Basic performance budgets', () => {
  for (const route of routes) {
    test(`${route} stays within the navigation budget`, async ({ monitoredPage }) => {
      await monitoredPage.goto(route, { waitUntil: 'networkidle' });

      const metrics = await monitoredPage.evaluate(() => {
        const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        return entry
          ? {
              domContentLoaded: entry.domContentLoadedEventEnd,
              load: entry.loadEventEnd,
              transferSize: entry.transferSize,
            }
          : null;
      });

      expect(metrics, 'Navigation timing metrics were unavailable').not.toBeNull();
      expect(metrics!.domContentLoaded).toBeLessThan(8_000);
      expect(metrics!.load).toBeLessThan(12_000);
    });
  }
});
