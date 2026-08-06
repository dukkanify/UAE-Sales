import { promises as fs } from 'node:fs';
import path from 'node:path';

const candidates = [path.resolve('app'), path.resolve('src/app')];
const appDir = candidates.find(async () => false);

async function directoryExists(dir) {
  try {
    return (await fs.stat(dir)).isDirectory();
  } catch {
    return false;
  }
}

let root = null;
for (const candidate of candidates) {
  if (await directoryExists(candidate)) {
    root = candidate;
    break;
  }
}

if (!root) {
  throw new Error('No Next.js App Router directory found at app/ or src/app/.');
}

const pageFiles = [];
const routeFiles = [];

async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (/^page\.(t|j)sx?$/.test(entry.name)) pageFiles.push(fullPath);
    if (/^route\.(t|j)s$/.test(entry.name)) routeFiles.push(fullPath);
  }
}

await walk(root);

function routeFromFile(file) {
  const relativeDir = path.relative(root, path.dirname(file));
  const segments = relativeDir
    .split(path.sep)
    .filter(Boolean)
    .filter(segment => !(segment.startsWith('(') && segment.endsWith(')')))
    .filter(segment => !segment.startsWith('@'));

  if (segments.some(segment => segment.startsWith('['))) return null;
  return `/${segments.join('/')}`.replace(/\/$/, '') || '/';
}

const publicRoutes = [...new Set(pageFiles.map(routeFromFile).filter(route => route && !route.startsWith('/admin')))];
const adminRoutes = [...new Set(pageFiles.map(routeFromFile).filter(route => route?.startsWith('/admin')))];
const apiRoutes = [...new Set(routeFiles.map(routeFromFile).filter(route => route?.startsWith('/api')))];

const output = {
  generatedAt: new Date().toISOString(),
  appDirectory: path.relative(process.cwd(), root),
  publicRoutes: publicRoutes.sort(),
  adminRoutes: adminRoutes.sort(),
  apiRoutes: apiRoutes.sort(),
};

await fs.mkdir('qa-report', { recursive: true });
await fs.writeFile('qa-report/discovered-routes.json', JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
