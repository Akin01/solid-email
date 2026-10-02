import { fileURLToPath } from 'node:url';
import solid from '@solidjs/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    solid({
      ssr: true,
      solid: { hydratable: false },
    }),
  ],
  resolve: {
    alias: {
      '@akin01/solid-email': fileURLToPath(
        new URL('../../packages/solid-email/src/index.ts', import.meta.url),
      ),
      '@solid-email/html-to-text': fileURLToPath(
        new URL('../../packages/html-to-text/src/index.ts', import.meta.url),
      ),
      '@solid-email/render': fileURLToPath(
        new URL('../../packages/render/src/node/index.ts', import.meta.url),
      ),
    },
    conditions: ['node', 'import'],
  },
});
