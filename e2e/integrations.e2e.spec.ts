import type { ChildProcess, ExecFileException } from 'node:child_process';
import { execFile, spawn } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const root = path.resolve(new URL('..', import.meta.url).pathname);
const e2eRoot = path.join(root, 'e2e');

type RenderExportCase = {
  conditions: readonly string[];
  name: string;
  target: 'browser' | 'edge' | 'node';
};

const renderExportCases = [
  { conditions: [], name: 'default/node', target: 'node' },
  { conditions: ['--conditions=default'], name: 'default', target: 'node' },
  { conditions: ['--conditions=node'], name: 'node', target: 'node' },
  { conditions: ['--conditions=browser'], name: 'browser', target: 'browser' },
  { conditions: ['--conditions=worker'], name: 'worker', target: 'browser' },
  { conditions: ['--conditions=deno'], name: 'deno', target: 'browser' },
  { conditions: ['--conditions=workerd'], name: 'workerd', target: 'edge' },
  {
    conditions: ['--conditions=edge-light'],
    name: 'edge-light',
    target: 'edge',
  },
  { conditions: ['--conditions=convex'], name: 'convex', target: 'edge' },
] as const satisfies readonly RenderExportCase[];

const renderExportSmoke = `
async function smokeRenderExport(mod, ssr) {
  if (typeof mod.render !== 'function') {
    throw new Error('missing render export');
  }
  if (typeof mod.renderSync !== 'function') {
    throw new Error('missing renderSync export');
  }
  if (typeof mod.toPlainText !== 'function') {
    throw new Error('missing toPlainText export');
  }
  if (typeof mod.pretty !== 'function') {
    throw new Error('missing pretty export');
  }

  const html = await mod.render(() =>
    ssr(['<main><h1>Condition Smoke</h1></main>']),
  );
  if (!html.startsWith('<!DOCTYPE html PUBLIC')) {
    throw new Error('missing email doctype');
  }
  if (!html.includes('<main><h1>Condition Smoke</h1></main>')) {
    throw new Error('missing rendered html');
  }

  const syncHtml = mod.renderSync('Condition Sync Smoke');
  if (!syncHtml.startsWith('<!DOCTYPE html PUBLIC')) {
    throw new Error('missing sync email doctype');
  }
  if (!syncHtml.includes('Condition Sync Smoke')) {
    throw new Error('missing sync rendered html');
  }

  const text = await mod.render(
    () => ssr(['<div><h1>Hello</h1><p>World</p></div>']),
    { plainText: true },
  );
  if (!text.includes('HELLO') || !text.includes('World') || text.includes('<h1>')) {
    throw new Error('plainText render failed');
  }

  const syncText = mod.renderSync('Hello sync', { plainText: true });
  if (!syncText.includes('Hello sync') || syncText.includes('<h1>')) {
    throw new Error('sync plainText render failed');
  }

  const utilityText = mod.toPlainText(
    '<a href="https://example.com">https://example.com</a>',
  );
  if (!utilityText.includes('https://example.com')) {
    throw new Error('toPlainText export failed');
  }

  const pretty = await mod.render(
    () => ssr(['<main><span>Pretty</span></main>']),
    { pretty: true },
  );
  if (!pretty.includes('\\n') || !pretty.includes('<span>Pretty</span>')) {
    throw new Error('pretty render failed');
  }

  const utilityPretty = await mod.pretty(
    '<span><!--[if mso]><b>x</b><![endif]--></span>',
  );
  if (!utilityPretty.includes('<!--[if mso]><b>x</b><![endif]-->')) {
    throw new Error('pretty export failed');
  }

  await mod.render(() => {
    throw new Error('smoke render failure');
  }).then(
    () => {
      throw new Error('render did not reject');
    },
    (error) => {
      if (!String(error?.message ?? error).includes('smoke render failure')) {
        throw error;
      }
    },
  );
}

function finishSmoke(resolved) {
  process.stdout.write(resolved.replaceAll('\\\\', '/') + '\\n', () =>
    process.exit(0),
  );
}
`;

const renderImportProbe = `${renderExportSmoke}
const resolved = import.meta.resolve('@solid-email/render');
const mod = await import('@solid-email/render');
const { ssr } = mod;
await smokeRenderExport(mod, ssr);
finishSmoke(resolved);`;

const renderRequireProbe = `${renderExportSmoke}
(async () => {
  const resolved = require.resolve('@solid-email/render');
  const mod = require('@solid-email/render');
  const { ssr } = mod;
  await smokeRenderExport(mod, ssr);
  finishSmoke(resolved);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});`;

// These probes use dynamic import because the tests intentionally exercise
// package export resolution under Node's condition flags.
const solidEmailBrowserImportProbe = `
const resolved = import.meta.resolve('@akin01/solid-email');
const mod = await import('@akin01/solid-email');

for (const name of ['Body', 'Button', 'Container', 'Heading', 'Preview', 'Row', 'Section', 'Text']) {
  if (typeof mod[name] !== 'function') {
    throw new Error(\`missing browser root export: \${name}\`);
  }
}

for (const name of ['render', 'renderSync', 'compile', 'compileSync', 'toPlainText', 'pretty', 'Tailwind']) {
  if (name in mod) {
    throw new Error(\`unexpected server-only browser root export: \${name}\`);
  }
}

process.stdout.write(resolved.replaceAll('\\\\', '/') + '\\n', () => process.exit(0));`;

const solidEmailBrowserRequireProbe = `
const resolved = require.resolve('@akin01/solid-email');
const mod = require('@akin01/solid-email');

for (const name of ['Body', 'Button', 'Container', 'Heading', 'Preview', 'Row', 'Section', 'Text']) {
  if (typeof mod[name] !== 'function') {
    throw new Error(\`missing browser root require export: \${name}\`);
  }
}

for (const name of ['render', 'renderSync', 'compile', 'compileSync', 'toPlainText', 'pretty', 'Tailwind']) {
  if (name in mod) {
    throw new Error(\`unexpected server-only browser root require export: \${name}\`);
  }
}

process.stdout.write(resolved.replaceAll('\\\\', '/') + '\\n', () => process.exit(0));`;

const solidEmailBrowserRootDomProbe = `
const resolved = import.meta.resolve('@akin01/solid-email');
const { JSDOM } = await import('jsdom');
const dom = new JSDOM('<!DOCTYPE html><main id="root"></main>', {
  url: 'https://solid.email/preview',
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;

const mod = await import('@akin01/solid-email');

for (const name of ['render', 'compile', 'Tailwind']) {
  if (name in mod) {
    throw new Error(\`unexpected browser root export: \${name}\`);
  }
}
for (const name of ['Container', 'Heading', 'Text', 'Preview']) {
  if (typeof mod[name] !== 'function') {
    throw new Error(\`missing browser root export: \${name}\`);
  }
}

const { render: mount } = await import('@solidjs/web');
const root = document.getElementById('root');
const dispose = mount(
  () =>
    mod.Container({
      style: { padding: '12px' },
      children: mod.Heading({
        as: 'h2',
        style: { color: 'purple' },
        children: mod.Text({ children: 'Browser root preview mounted' }),
      }),
    }),
  root,
);

const heading = root.querySelector('h2');
if (!heading || heading.textContent !== 'Browser root preview mounted') {
  throw new Error(\`missing mounted browser root heading: \${root.innerHTML}\`);
}
if (!root.querySelector('table')) {
  throw new Error(\`missing mounted email layout table: \${root.innerHTML}\`);
}

dispose();
process.stdout.write(resolved.replaceAll('\\\\', '/') + '\\n', () => process.exit(0));`;

const solidEmailServerRootSmoke = `
async function assertSolidEmailServerRoot(mod, expectedText) {
  for (const name of ['render', 'Tailwind', 'Text']) {
    if (typeof mod[name] !== 'function') {
      throw new Error(\`missing server root export: \${name}\`);
    }
  }

  const html = await mod.render(() =>
    mod.Tailwind({
      children: mod.Text({
        class: 'text-blue-600',
        children: expectedText,
      }),
    }),
  );

  if (!html.includes(expectedText)) {
    throw new Error(\`missing rendered Tailwind text: \${html}\`);
  }
  if (html.includes('text-blue-600')) {
    throw new Error(\`Tailwind class was not removed: \${html}\`);
  }
  if (!html.includes('color:rgb(21,93,252)')) {
    throw new Error(\`Tailwind class was not inlined: \${html}\`);
  }
}
`;

const solidEmailServerImportProbe = `${solidEmailServerRootSmoke}
const resolved = import.meta.resolve('@akin01/solid-email');
const mod = await import('@akin01/solid-email');
await assertSolidEmailServerRoot(mod, 'Solid Email ESM Tailwind safe');
process.stdout.write(resolved.replaceAll('\\\\', '/') + '\\n', () => process.exit(0));`;

const solidEmailServerRequireProbe = `${solidEmailServerRootSmoke}
(async () => {
  const resolved = require.resolve('@akin01/solid-email');
  const mod = require('@akin01/solid-email');
  await assertSolidEmailServerRoot(mod, 'Solid Email CJS Tailwind safe');
  process.stdout.write(resolved.replaceAll('\\\\', '/') + '\\n', () => process.exit(0));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});`;

type PnpmError = ExecFileException & {
  stderr?: string;
  stdout?: string;
};

function isPnpmError(error: unknown): error is PnpmError {
  return error instanceof Error;
}

type FixtureName = 'vite' | 'tanstack-start' | 'cloudflare-tanstack-start';

type PreviewServer = {
  output: () => string;
  process: ChildProcess;
  stop: () => Promise<void>;
};

async function cleanFixture(fixture: FixtureName): Promise<void> {
  const fixtureRoot = path.join(e2eRoot, fixture);
  await rm(path.join(fixtureRoot, 'dist'), { recursive: true, force: true });
  await rm(path.join(fixtureRoot, '.types'), { recursive: true, force: true });
  await rm(path.join(fixtureRoot, '.render'), { recursive: true, force: true });
  await rm(path.join(fixtureRoot, '.output'), { recursive: true, force: true });
  await rm(path.join(fixtureRoot, '.tanstack'), {
    recursive: true,
    force: true,
  });
  await rm(path.join(fixtureRoot, '.wrangler'), {
    recursive: true,
    force: true,
  });
  await rm(path.join(fixtureRoot, 'src/routeTree.gen.ts'), {
    force: true,
  });
}

async function runPnpm(args: string[], cwd = root): Promise<string> {
  try {
    const { stdout } = await execFileAsync('pnpm', args, {
      cwd,
      env: { ...process.env, CI: '1' },
      maxBuffer: 1024 * 1024 * 20,
    });
    return stdout;
  } catch (error) {
    if (isPnpmError(error)) {
      const output = [error.stderr, error.stdout].filter(Boolean).join('\n');
      throw new Error(output || error.message);
    }

    throw error;
  }
}

async function prepareWorkspacePackages(): Promise<void> {
  await runPnpm(['--filter', '@solid-email/html-to-text', 'run', 'build']);
  await runPnpm(['--filter', '@solid-email/render', 'run', 'build']);
  await runPnpm(['--filter', '@akin01/solid-email', 'run', 'build']);
}

async function installAndBuildFixture(fixture: FixtureName) {
  const fixtureRoot = path.join(e2eRoot, fixture);
  await cleanFixture(fixture);

  await runPnpm(['run', 'build'], fixtureRoot);
  await runPnpm(['exec', 'tsc', '--noEmit'], fixtureRoot);
  await runPnpm(
    [
      'exec',
      'tsc',
      '--declaration',
      '--emitDeclarationOnly',
      '--declarationMap',
      'false',
      '--outDir',
      '.types',
    ],
    fixtureRoot,
  );
  return fixtureRoot;
}

async function getAvailablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  if (typeof address === 'object' && address !== null) {
    return address.port;
  }

  throw new Error('Unable to allocate a preview port');
}

function startFixturePreview(fixtureRoot: string, port: number): PreviewServer {
  const child = spawn(
    'pnpm',
    ['run', 'preview', '--port', String(port), '--strictPort'],
    {
      cwd: fixtureRoot,
      env: { ...process.env, CI: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let output = '';
  child.stdout?.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr?.on('data', (chunk) => {
    output += chunk.toString();
  });

  return {
    output: () => output,
    process: child,
    stop: async () => {
      if (child.exitCode !== null) {
        return;
      }

      child.kill('SIGTERM');
      await new Promise<void>((resolve) => {
        child.once('exit', () => resolve());
      });
    },
  };
}

async function fetchWhenReady(
  url: string,
  server: PreviewServer,
): Promise<Response> {
  const deadline = Date.now() + 60_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    if (server.process.exitCode !== null) {
      throw new Error(
        `Preview exited before serving ${url}.\n${server.output()}`,
      );
    }

    try {
      return await fetch(url);
    } catch (error) {
      lastError = error;
      await delay(250);
    }
  }

  throw new Error(
    `Timed out waiting for ${url}: ${String(lastError)}\n${server.output()}`,
  );
}

async function resolveRenderImport(entry: RenderExportCase): Promise<string> {
  const { stdout } = await execFileAsync(
    'node',
    [...entry.conditions, '--input-type=module', '--eval', renderImportProbe],
    { cwd: root },
  );
  return stdout.trim();
}

async function resolveRenderRequire(entry: RenderExportCase): Promise<string> {
  const { stdout } = await execFileAsync(
    'node',
    [...entry.conditions, '--eval', renderRequireProbe],
    { cwd: root },
  );
  return stdout.trim();
}

function expectAllComponentsHtml(html: string, label: string): void {
  expect(html).toContain(label);
  expect(html).toContain('margin-left:auto');
  expect(html).toContain('margin-right:auto');
  expect(html).toContain('background-color:rgb(255,255,255)');
  expect(html).toContain('padding:1rem');
  expect(html).toContain('font-size:0.875rem');
  expect(html).toContain('color:rgb(21,93,252)');
  expect(html).not.toContain('mx-auto bg-white p-4');
  expect(html).toContain('<html lang="en" dir="ltr"');
  expect(html).toContain('<body');
  expect(html).toContain('@font-face');
  expect(html).toContain('InterFixture');
  expect(html).toContain('<title>All components e2e preview</title>');
  expect(html).toContain('All components e2e preview');
  expect(html).toContain('Comprehensive components e2e');
  expect(html).toContain('<hr');
  expect(html).toContain('Solid Email fixture logo');
  expect(html).toContain('href="https://example.com/link"');
  expect(html).toContain('Plain link component');
  expect(html).toContain('href="https://example.com/action"');
  expect(html).toContain('Button component');
  expect(html).toContain('mso-font-width');
  expect(html).toContain('cino');
  expect(html).toContain('cio');
  expect(html).toContain('const solid = true;');
  expect(html).toContain('data-id="_solid-email-column"');
  expect(html).toContain('data-id="_solid-email-markdown"');
  expect(html).toContain('Markdown heading');
  expect(html).toContain('Quoted markdown block');
  expect(html).toContain('First ordered item');
  expect(html).toContain('First unordered item');
  expect(html).toContain('Markdown image');
  expect(html).toContain('inline markdown code');
  expect(html).toContain('const answer = 42;');
  expect(html).toContain('function');
  expect(html).toContain('greet');
  expect(html).toContain('Hello');
}

beforeAll(async () => {
  await prepareWorkspacePackages();
});

afterAll(async () => {
  await Promise.all([
    cleanFixture('vite'),
    cleanFixture('tanstack-start'),
    cleanFixture('cloudflare-tanstack-start'),
  ]);
  await rm(path.join(e2eRoot, '.tmp'), { recursive: true, force: true });
});

describe('published package integration fixtures', () => {
  it('resolves and loads render package conditional exports', async () => {
    for (const entry of renderExportCases) {
      await expect(resolveRenderImport(entry), entry.name).resolves.toContain(
        `/dist/${entry.target}/index.mjs`,
      );
      await expect(resolveRenderRequire(entry), entry.name).resolves.toContain(
        `/dist/${entry.target}/index.cjs`,
      );
    }
  });

  it('loads solid-email root server entry in ESM and CJS', async () => {
    const esm = await execFileAsync(
      'node',
      ['--input-type=module', '--eval', solidEmailServerImportProbe],
      { cwd: root },
    );
    const cjs = await execFileAsync(
      'node',
      ['--eval', solidEmailServerRequireProbe],
      { cwd: root },
    );

    expect(esm.stdout.trim().replaceAll('\\', '/')).toContain(
      '/packages/solid-email/dist/index.mjs',
    );
    expect(cjs.stdout.trim().replaceAll('\\', '/')).toContain(
      '/packages/solid-email/dist/index.cjs',
    );
  });

  it('loads solid-email root under browser import conditions', async () => {
    const { stdout } = await execFileAsync(
      'node',
      [
        '--conditions=browser',
        '--input-type=module',
        '--eval',
        solidEmailBrowserImportProbe,
      ],
      { cwd: root },
    );

    expect(stdout.trim().replaceAll('\\', '/')).toContain(
      '/packages/solid-email/dist/client/index.mjs',
    );
  });

  it('requires solid-email root under browser conditions', async () => {
    const { stdout } = await execFileAsync(
      'node',
      ['--conditions=browser', '--eval', solidEmailBrowserRequireProbe],
      { cwd: root },
    );

    expect(stdout.trim().replaceAll('\\', '/')).toContain(
      '/packages/solid-email/dist/client/index.cjs',
    );
  });

  it('mounts the browser root condition in a Solid DOM preview', async () => {
    const { stdout } = await execFileAsync(
      'node',
      [
        '--conditions=browser',
        '--input-type=module',
        '--eval',
        solidEmailBrowserRootDomProbe,
      ],
      { cwd: root },
    );

    expect(stdout.trim().replaceAll('\\', '/')).toContain(
      '/packages/solid-email/dist/client/index.mjs',
    );
  });

  it('builds and renders in a Solid Vite SSR fixture', async () => {
    const fixtureRoot = await installAndBuildFixture('vite');
    const html = await execFileAsync('node', ['dist/entry-server.mjs'], {
      cwd: fixtureRoot,
      maxBuffer: 1024 * 1024 * 5,
    }).then(({ stdout }) => stdout);

    expectAllComponentsHtml(html, 'Vite Solid email');

    const entryTypes = await readFile(
      path.join(fixtureRoot, '.types/src/entry-server.d.ts'),
      'utf8',
    );
    expect(entryTypes).toContain('renderEmail(): Promise<string>');
  });

  it('builds a TanStack Start Solid fixture', async () => {
    const fixtureRoot = await installAndBuildFixture('tanstack-start');
    const routeTree = await readFile(
      path.join(fixtureRoot, 'src/routeTree.gen.ts'),
      'utf8',
    );

    expect(routeTree).toContain('/');
    const html = await runPnpm(['run', 'render:email'], fixtureRoot);
    expectAllComponentsHtml(html, 'TanStack Start Solid email');

    const serverTypes = await readFile(
      path.join(fixtureRoot, '.types/src/email.functions.d.ts'),
      'utf8',
    );
    expect(serverTypes).toContain('renderFixtureEmailStatus');
    const componentTypes = await readFile(
      path.join(fixtureRoot, '.types/src/all-components-email.d.ts'),
      'utf8',
    );
    expect(componentTypes).toContain('AllComponentsEmail');
  });

  it('renders solid-email through a Cloudflare TanStack Start Worker route', async () => {
    const fixtureRoot = await installAndBuildFixture(
      'cloudflare-tanstack-start',
    );
    const routeTree = await readFile(
      path.join(fixtureRoot, 'src/routeTree.gen.ts'),
      'utf8',
    );
    expect(routeTree).toContain('/');

    const port = await getAvailablePort();
    const preview = startFixturePreview(fixtureRoot, port);

    try {
      const response = await fetchWhenReady(
        `http://127.0.0.1:${port}/`,
        preview,
      );
      const html = await response.text();
      const decodedHtml = html
        .replaceAll('&quot;', '"')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&');

      expect(response.status, html).toBe(200);
      expect(html).toContain('data-email-status="rendered"');
      expect(html).toContain('Cloudflare TanStack Start Solid route loaded');
      expectAllComponentsHtml(
        decodedHtml,
        'Cloudflare TanStack Solid email rendered',
      );
      expect(html).toContain('Cloudflare TanStack Solid email rendered');
      expect(html).toContain('Hello Cloudflare TanStack Worker!');
      expect(html).toContain('Solid Start route graph');
      expect(html).toContain('href="https://example.com/action"');
      expect(html).toContain('@solid-email/render in Workerd');
    } finally {
      await preview.stop();
    }
  });
});
