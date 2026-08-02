import { readFile } from 'node:fs/promises';
import path from 'node:path';

type DiscoveredRoutes = {
  publicRoutes: string[];
  adminRoutes: string[];
  apiRoutes: string[];
};

const routeFile = path.resolve('qa-report/discovered-routes.json');

export async function loadDiscoveredRoutes(): Promise<DiscoveredRoutes> {
  const raw = await readFile(routeFile, 'utf8');
  const parsed = JSON.parse(raw) as Partial<DiscoveredRoutes>;

  return {
    publicRoutes: [...new Set(parsed.publicRoutes ?? [])],
    adminRoutes: [...new Set(parsed.adminRoutes ?? [])],
    apiRoutes: [...new Set(parsed.apiRoutes ?? [])],
  };
}
