import type { ExecFileException } from 'node:child_process';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const root = path.resolve(new URL('..', import.meta.url).pathname);
const e2eRoot = path.join(root, 'e2e');
const packDir = path.join(e2eRoot, '.tmp', 'packs');

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
const { ssr } = await import('solid-js/web/dist/server.js');
await smokeRenderExport(mod, ssr);
finishSmoke(resolved);`;

const renderRequireProbe = `${renderExportSmoke}
(async () => {
  const resolved = require.resolve('@solid-email/render');
  const mod = require('@solid-email/render');
  const { ssr } = require('solid-js/web/dist/server.cjs');
  await smokeRenderExport(mod, ssr);
  finishSmoke(resolved);
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

async function cleanFixture(fixture: 'vite' | 'tanstack-start'): Promise<void> {
  const fixtureRoot = path.join(e2eRoot, fixture);
  await rm(path.join(fixtureRoot, 'node_modules'), {
    recursive: true,
    force: true,
  });
  await rm(path.join(fixtureRoot, 'dist'), { recursive: true, force: true });
  await rm(path.join(fixtureRoot, '.types'), { recursive: true, force: true });
  await rm(path.join(fixtureRoot, '.render'), { recursive: true, force: true });
  await rm(path.join(fixtureRoot, '.output'), { recursive: true, force: true });
  await rm(path.join(fixtureRoot, '.tanstack'), {
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

async function preparePackedPackages(): Promise<void> {
  await rm(path.join(e2eRoot, '.tmp'), { recursive: true, force: true });
  await mkdir(packDir, { recursive: true });

  await runPnpm(['--filter', '@solid-email/render', 'run', 'build']);
  await runPnpm(['--filter', '@akin01/solid-email', 'run', 'build']);
  await runPnpm([
    '--filter',
    '@solid-email/render',
    'pack',
    '--pack-destination',
    packDir,
  ]);
  await runPnpm([
    '--filter',
    '@akin01/solid-email',
    'pack',
    '--pack-destination',
    packDir,
  ]);
}

async function installAndBuildFixture(fixture: 'vite' | 'tanstack-start') {
  const fixtureRoot = path.join(e2eRoot, fixture);
  await cleanFixture(fixture);

  await runPnpm(['install', '--no-lockfile'], fixtureRoot);
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
  expect(html).not.toContain('class="mx-auto bg-white p-4"');
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
  await preparePackedPackages();
});

afterAll(async () => {
  await Promise.all([cleanFixture('vite'), cleanFixture('tanstack-start')]);
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
});
