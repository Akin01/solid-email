import solidPlugin from '@solidjs/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [solidPlugin({ ssr: true })],
  build: {
    outDir: '.render',
    ssr: 'src/render-email.ts',
    target: 'node22',
    rollupOptions: {
      output: {
        entryFileNames: 'render-email.mjs',
      },
    },
  },
});
