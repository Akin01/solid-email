import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

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
