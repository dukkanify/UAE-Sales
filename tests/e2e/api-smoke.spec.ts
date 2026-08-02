import { test, expect } from '@playwright/test';
import { apiSmokeRoutes } from './qa-routes';

test.describe('API smoke tests', () => {
  for (const route of apiSmokeRoutes) {
    test(`${route} responds without a server failure`, async ({ request }) => {
      const response = await request.get(route, { timeout: 20_000 });
      expect(response.status(), `${route} returned ${response.status()}`).toBeLessThan(500);
      expect(response.status(), `${route} was not found`).not.toBe(404);

      const contentType = response.headers()['content-type'] ?? '';
      if (response.ok() && contentType.includes('application/json')) {
        const body = await response.json();
        expect(body).not.toBeNull();
      }
    });
  }

  test('protected admin API does not allow anonymous access', async ({ request }) => {
    const response = await request.get('/api/admin/users', { timeout: 20_000 });
    expect([401, 403, 404]).toContain(response.status());
  });
});
