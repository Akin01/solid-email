import solidPlugin from '@solidjs/vite-plugin';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tanstackStart(), solidPlugin({ ssr: true })],
  build: {
    target: 'node22',
  },
});
