import { test, expect } from './fixtures/qa';

const visualRoutes = [
  { name: 'home', path: '/' },
  { name: 'categories', path: '/categories' },
  { name: 'listings', path: '/listings' },
  { name: 'admin-login', path: '/admin/' },
] as const;

test.describe('Visual regression', () => {
  for (const route of visualRoutes) {
    test(`${route.name} matches the approved baseline`, async ({ monitoredPage }) => {
      await monitoredPage.goto(route.path, { waitUntil: 'networkidle' });
      await monitoredPage.evaluate(() => document.fonts.ready);
      await expect(monitoredPage).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});
