import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/unit/**/*.{test,spec}.ts", "tests/integration/**/*.{test,spec}.ts"],
    exclude: ["node_modules", ".next", "e2e"],
    // Shared `.data/*.json` stores are process-local; keep integration files
    // from racing each other across Vitest workers on CI.
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["lib/**/*.ts", "services/**/*.ts", "utils/**/*.ts", "constants/**/*.ts"],
      exclude: ["**/*.d.ts", "**/seed.ts", "**/store.ts"],
    },
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 15000,
  },

  resolve: {
    alias: {
      "@": root,
    },
  },
});
