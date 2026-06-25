import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid({ ssr: true, solid: { hydratable: false } })],
  resolve: {
    alias: {
      '@solid-email/html-to-text': new URL(
        '../html-to-text/src/index.ts',
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    globals: true,
  },
});
