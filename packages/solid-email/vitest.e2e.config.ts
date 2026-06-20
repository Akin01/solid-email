import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    hookTimeout: 60_000,
    include: ['*.e2e.spec.ts'],
    testTimeout: 60_000,
  },
});
