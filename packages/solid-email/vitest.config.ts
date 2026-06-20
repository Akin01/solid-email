import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid({ ssr: true, solid: { hydratable: false } })],
  resolve: {
    alias: {
      '@solid-email/render': new URL(
        '../render/src/node/index.ts',
        import.meta.url,
      ).pathname,
    },
  },
  test: { globals: true },
});
