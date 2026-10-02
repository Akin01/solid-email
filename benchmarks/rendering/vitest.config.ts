import solid from '@solidjs/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: false,
  esbuild: {
    jsx: 'automatic',
  },
  plugins: [
    solid({
      exclude: [
        '**/react-email-template.tsx',
        '**/react-tailwind-template.tsx',
      ],
      ssr: true,
      solid: { hydratable: false },
    }),
  ],
  resolve: {
    alias: {
      '@akin01/solid-email': new URL(
        '../../packages/solid-email/src/index.ts',
        import.meta.url,
      ).pathname,
      '@solid-email/render': new URL(
        '../../packages/render/src/node/index.ts',
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    environment: 'node',
    benchmark: {
      include: ['**/*.bench.ts'],
    },
  },
});
