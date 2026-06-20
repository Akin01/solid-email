#!/usr/bin/env node
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformAsync } from '@babel/core';
import { type Options, render } from '@solid-email/render';
import { Command } from 'commander';
import { build as esbuild, type Plugin } from 'esbuild';
import { glob } from 'glob';

const packageVersion = '0.1.0';
const require = createRequire(import.meta.url);
const solidPreset = require.resolve('babel-preset-solid');
const staticDirName = 'static';

type ExportOptions = Options & {
  dir: string;
  outDir: string;
  silent?: boolean;
};

function log(message: string, silent?: boolean) {
  if (!silent) console.log(message);
}

async function pathExists(target: string) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function discoverTemplates(dir: string) {
  return glob('**/*.{js,jsx,ts,tsx,mjs,cjs}', {
    absolute: true,
    cwd: dir,
    ignore: ['**/_*/**', '**/static/**', '**/*.d.ts'],
    nodir: true,
  });
}

function slugForTemplate(file: string, emailsDir: string) {
  const relative = path.relative(emailsDir, file);
  return relative
    .replace(/\.[cm]?[jt]sx?$/, '')
    .split(path.sep)
    .join('/');
}

const solidSsrPlugin: Plugin = {
  name: 'solid-ssr-jsx',
  setup(build) {
    build.onLoad({ filter: /\.[cm]?[jt]sx$/ }, async (args) => {
      const source = await readFile(args.path, 'utf8');
      const transformed = await transformAsync(source, {
        babelrc: false,
        configFile: false,
        filename: args.path,
        presets: [[solidPreset, { generate: 'ssr', hydratable: false }]],
      });

      return {
        contents: transformed?.code ?? source,
        loader: 'js',
      };
    });
  },
};

async function importTemplate(file: string, cacheDir: string) {
  const bundledFile = path.join(
    cacheDir,
    `${path.basename(file).replace(/\W/g, '_')}-${Date.now()}.mjs`,
  );
  await esbuild({
    bundle: true,
    entryPoints: [file],
    external: ['@akin01/solid-email', '@solid-email/render'],
    format: 'esm',
    outfile: bundledFile,
    platform: 'node',
    plugins: [solidSsrPlugin],
  });

  return import(`${pathToFileURL(bundledFile).href}?t=${Date.now()}`).then(
    (module) => module.default ?? module,
  );
}

async function copyStatic(emailsDir: string, outDir: string) {
  const staticDir = path.join(emailsDir, staticDirName);
  if (await pathExists(staticDir)) {
    await cp(staticDir, path.join(outDir, staticDirName), { recursive: true });
  }
}

async function exportTemplates(options: ExportOptions) {
  const emailsDir = path.resolve(options.dir);
  const outDir = path.resolve(options.outDir);
  if (!(await pathExists(emailsDir))) {
    throw new Error(`Missing email directory: ${emailsDir}`);
  }

  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });

  const templates = await discoverTemplates(emailsDir);
  const cacheDir = path.join(outDir, '.cache');
  await mkdir(cacheDir, { recursive: true });
  for (const file of templates) {
    const template = await importTemplate(file, cacheDir);
    const component =
      typeof template === 'function' ? template : template?.default;
    if (typeof component !== 'function') {
      throw new Error(`Template ${file} does not export a default component`);
    }

    const slug = slugForTemplate(file, emailsDir);
    const targetBase = path.join(outDir, slug);
    await mkdir(path.dirname(targetBase), { recursive: true });
    const html = await render(() => component({}), {
      pretty: options.pretty,
    });
    await writeFile(`${targetBase}.html`, html);

    if (options.plainText) {
      const text = await render(() => component({}), {
        plainText: true,
        htmlToTextOptions: options.htmlToTextOptions,
      });
      await writeFile(`${targetBase}.txt`, text);
    }
    log(`Exported ${slug}`, options.silent);
  }

  await rm(cacheDir, { force: true, recursive: true });
  await copyStatic(emailsDir, outDir);
  log(`Exported ${templates.length} template(s) to ${outDir}`, options.silent);
}

async function listFiles(root: string) {
  const entries = await readdir(root, { withFileTypes: true });
  return entries.map((entry) => ({
    name: entry.name,
    fullPath: path.join(root, entry.name),
    isFile: () => entry.isFile(),
  }));
}

function contentType(filePath: string) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

async function startStaticServer(root: string, port: number) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://localhost:${port}`);
    const requested = decodeURIComponent(
      url.pathname === '/' ? '/index.html' : url.pathname,
    );
    const filePath = path.join(root, requested);
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    try {
      const file = await readFile(filePath);
      response.writeHead(200, { 'content-type': contentType(filePath) });
      response.end(file);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve());
  });
  console.log(`Solid Email preview running at http://localhost:${port}`);
}

async function buildPreview(dir: string) {
  const outDir = path.resolve('.solid-email');
  await exportTemplates({
    dir,
    outDir: path.join(outDir, 'emails'),
    pretty: true,
    silent: true,
  });
  const emails = await listFiles(path.join(outDir, 'emails')).catch(() => []);
  const links = emails
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map(
      (entry) => `<li><a href="/emails/${entry.name}">${entry.name}</a></li>`,
    )
    .join('');
  await writeFile(
    path.join(outDir, 'index.html'),
    `<!doctype html><html><head><title>Solid Email</title></head><body><h1>Solid Email</h1><ul>${links}</ul></body></html>`,
  );
  console.log(`Built preview at ${outDir}`);
}

const program = new Command();
program.name('email').description('Solid Email CLI').version(packageVersion);

program
  .command('export')
  .description('Export email templates to HTML')
  .option('-d, --dir <dir>', 'emails directory', './emails')
  .option('-o, --outDir <dir>', 'output directory', 'out')
  .option('--pretty', 'format HTML output')
  .option('--plainText', 'also emit plain text files')
  .option('--silent', 'suppress per-template logs')
  .action(async (flags) => {
    await exportTemplates({
      dir: flags.dir,
      outDir: flags.outDir,
      pretty: flags.pretty,
      plainText: flags.plainText,
      silent: flags.silent,
    });
  });

program
  .command('dev')
  .description('Start a local preview server')
  .option('-d, --dir <dir>', 'emails directory', './emails')
  .option('-p, --port <port>', 'port', '3000')
  .option('--clients <clients>', 'compatibility client list')
  .action(async (flags) => {
    await buildPreview(flags.dir);
    await startStaticServer(
      path.resolve('.solid-email'),
      Number.parseInt(flags.port, 10),
    );
  });

program
  .command('build')
  .description('Build the preview app')
  .option('-d, --dir <dir>', 'emails directory', './emails')
  .action(async (flags) => {
    await buildPreview(flags.dir);
  });

program
  .command('start')
  .description('Serve a built preview')
  .option('-p, --port <port>', 'port', '3000')
  .action(async (flags) => {
    const root = path.resolve('.solid-email');
    if (!(await pathExists(root)))
      throw new Error('Missing .solid-email. Run email build first.');
    await startStaticServer(root, Number.parseInt(flags.port, 10));
  });

const resend = program
  .command('resend')
  .description('Manage Resend configuration');
resend
  .command('setup')
  .description('Store a Resend API key placeholder')
  .action(() => {
    console.log(
      'Set RESEND_API_KEY in your environment for Solid Email preview integrations.',
    );
  });
resend
  .command('reset')
  .description('Reset Resend configuration')
  .action(() => {
    console.log('Resend configuration reset.');
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
