import solid from 'vite-plugin-solid';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    solid({
      ssr: true,
      solid: { hydratable: false },
    }),
  ],
  resolve: {
    conditions: ['node', 'import'],
  },
});
