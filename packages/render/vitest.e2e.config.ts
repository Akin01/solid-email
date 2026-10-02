import solid from '@solidjs/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid({ ssr: true, solid: { hydratable: false } })],
  test: {
    environment: 'node',
    globals: true,
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
});
