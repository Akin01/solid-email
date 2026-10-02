import solidPlugin from '@solidjs/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [solidPlugin({ ssr: true })],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'node22',
    rollupOptions: {
      output: {
        entryFileNames: 'entry-server.mjs',
      },
    },
  },
});
