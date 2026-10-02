import { cloudflare } from '@cloudflare/vite-plugin';
import solidPlugin from '@solidjs/vite-plugin';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { defineConfig, type Plugin } from 'vite';

function patchTanstackStartPlugin(): Plugin {
  return {
    name: 'patch-tanstack-start',
    enforce: 'pre',
    transform(code, id) {
      if (
        id.includes('server-functions-handler') &&
        code.includes('parseServerFunctionUrl')
      ) {
        return code.replace(
          /parseServerFunctionUrl/g,
          'parseServerFunctionActionUrl',
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [
    patchTanstackStartPlugin(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    solidPlugin({ ssr: true }),
  ],
});
