import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  root,
  test: {
    globals: true,
    hookTimeout: 120_000,
    include: ['e2e/*.e2e.spec.ts'],
    testTimeout: 120_000,
  },
});
