import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';

const serverWebPath = fileURLToPath(
  new URL('../../node_modules/@solidjs/web/dist/server.js', import.meta.url),
);
export default defineConfig([
  {
    dts: true,
    entry: ['./src/node/index.ts'],
    deps: { neverBundle: ['solid-js', '@solidjs/web'] },
    format: ['cjs', 'esm'],
    outDir: './dist/node',
  },
  {
    dts: true,
    entry: ['./src/browser/index.ts'],
    alias: {
      '@solidjs/web': serverWebPath,
    },
    deps: {
      alwaysBundle: ['@solidjs/web'],
      neverBundle: ['solid-js'],
    },
    format: ['cjs', 'esm'],
    outDir: './dist/browser',
  },
  {
    dts: true,
    entry: ['./src/edge/index.ts'],
    deps: { neverBundle: ['solid-js', '@solidjs/web'] },
    format: ['cjs', 'esm'],
    outDir: './dist/edge',
  },
]);
