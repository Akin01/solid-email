import { defineConfig } from 'tsdown';
import solid from 'vite-plugin-solid';

export default defineConfig([
  {
    dts: false,
    entry: ['./src/cli/index.ts'],
    deps: { neverBundle: ['solid-js', 'solid-js/web'] },
    format: ['esm'],
    outDir: './dist/cli',
  },
  {
    dts: true,
    entry: ['./src/index.ts'],
    deps: { neverBundle: ['solid-js', 'solid-js/web', '@solid-email/render'] },
    format: ['cjs', 'esm'],
    outDir: './dist',
    plugins: [solid({ solid: { generate: 'ssr', hydratable: false } })],
  },
]);
