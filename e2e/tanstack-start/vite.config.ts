import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [tanstackStart(), solidPlugin({ ssr: true })],
  build: {
    target: 'node22',
  },
});
