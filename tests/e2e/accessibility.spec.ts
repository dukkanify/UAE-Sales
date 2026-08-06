import { test, expect } from './fixtures/qa';

const routes = ['/', '/categories', '/listings', '/admin/'];

test.describe('Accessibility smoke checks', () => {
  for (const route of routes) {
    test(`${route} has basic accessible structure`, async ({ monitoredPage }) => {
      await monitoredPage.goto(route, { waitUntil: 'domcontentloaded' });

      const results = await monitoredPage.evaluate(() => {
        const html = document.documentElement;
        const imagesMissingAlt = Array.from(document.querySelectorAll('img')).filter(
          image => !image.hasAttribute('alt'),
        ).length;
        const buttonsMissingName = Array.from(document.querySelectorAll('button')).filter(button => {
          const label = button.getAttribute('aria-label')?.trim();
          const text = button.textContent?.trim();
          const title = button.getAttribute('title')?.trim();
          return !label && !text && !title;
        }).length;
        const inputsMissingLabel = Array.from(document.querySelectorAll('input, select, textarea')).filter(element => {
          const id = element.getAttribute('id');
          const ariaLabel = element.getAttribute('aria-label')?.trim();
          const ariaLabelledBy = element.getAttribute('aria-labelledby')?.trim();
          const title = element.getAttribute('title')?.trim();
          const hasLabel = id ? Boolean(document.querySelector(`label[for="${CSS.escape(id)}"]`)) : false;
          return !ariaLabel && !ariaLabelledBy && !title && !hasLabel;
        }).length;

        return {
          lang: html.getAttribute('lang'),
          dir: html.getAttribute('dir'),
          imagesMissingAlt,
          buttonsMissingName,
          inputsMissingLabel,
        };
      });

      expect(results.lang, 'The html element must define a language').toBeTruthy();
      expect(results.dir, 'The html element must define text direction').toBeTruthy();
      expect(results.imagesMissingAlt, 'Images without alt attributes were found').toBe(0);
      expect(results.buttonsMissingName, 'Buttons without accessible names were found').toBe(0);
      expect(results.inputsMissingLabel, 'Form controls without labels were found').toBe(0);
    });
  }
});
