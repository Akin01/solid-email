/**
 * Solid-Email benchmark runner
 *
 * Modes:
 *   1. renderSync      – static template, no caching
 *   2. compileSync     – pre-compiled template, render with slot data (cached render)
 *
 * Memory tracking: measures heap usage before/after each mode.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { renderSync, compileSync } from '@akin01/solid-email';
import { createSolidMarketingEmail } from './template';
import { CompiledMarketingEmail } from './compiled-template';
import { marketingProps } from '../shared/fixture-data';
import { takeSnapshot, toMB } from '../shared/memory';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(__dirname, '..', 'results');

const WARMUP = 3;
const RUNS = 10;
const ITERATIONS_PER_RUN = 50;

interface MemoryInfo {
  heapUsedMB: number;
  rssMB: number;
}

interface BenchResult {
  name: string;
  avgMs: number;
  minMs: number;
  maxMs: number;
  opsPerSec: number;
  outputBytes: number;
  memory: MemoryInfo;
}

function benchSync(
  name: string,
  fn: () => string,
  warmup: number,
  runs: number,
  iterations: number,
): { avgMs: number; minMs: number; maxMs: number; opsPerSec: number; outputBytes: number } {
  for (let i = 0; i < warmup; i++) fn();

  const times: number[] = [];
  let lastOutput = '';
  for (let r = 0; r < runs; r++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      lastOutput = fn();
    }
    const elapsed = performance.now() - start;
    times.push(elapsed / iterations);
  }

  const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);
  return {
    avgMs,
    minMs,
    maxMs,
    opsPerSec: 1000 / avgMs,
    outputBytes: Buffer.byteLength(lastOutput),
  };
}

function assertIncludes(label: string, output: string, values: string[]) {
  for (const v of values) {
    if (!output.includes(v)) {
      throw new Error(`${label} output missing: "${v}"`);
    }
  }
}

function main() {
  // ---- Render once to verify and save output HTML ----
  const testHtml = renderSync(() => createSolidMarketingEmail(marketingProps));
  assertIncludes('solid-email renderSync', testHtml, ['Launch Week', 'Product highlights']);

  mkdirSync(RESULTS_DIR, { recursive: true });
  writeFileSync(join(RESULTS_DIR, 'solid.html'), testHtml, 'utf-8');

  // ---- Baseline memory after all imports ----
  const baseline = takeSnapshot();

  const results: BenchResult[] = [];

  // ---- 1. renderSync (static) ----
  const syncPerf = benchSync(
    'solid-email renderSync',
    () => renderSync(() => createSolidMarketingEmail(marketingProps)),
    WARMUP,
    RUNS,
    ITERATIONS_PER_RUN,
  );
  const afterSync = takeSnapshot();
  results.push({
    name: 'solid-email renderSync',
    ...syncPerf,
    memory: {
      heapUsedMB: toMB(afterSync.heapUsed - baseline.heapUsed),
      rssMB: toMB(afterSync.rss - baseline.rss),
    },
  });

  // ---- 2. compileSync + cached render ----
  const beforeCompile = takeSnapshot();
  const compiled = compileSync(() => CompiledMarketingEmail() as any);
  const afterCompile = takeSnapshot();
  const compileOverheadMB = toMB(afterCompile.heapUsed - beforeCompile.heapUsed);

  // Verify compiled output renders correctly
  const compiledHtml = compiled.renderSync({
    preview: marketingProps.preview,
    headline: marketingProps.headline,
    intro: marketingProps.intro,
    ctaHref: marketingProps.ctaHref,
    footerReason: marketingProps.footerReason,
  });
  assertIncludes('solid-email compileSync render', compiledHtml, ['Launch Week', 'Product highlights']);

  const compilePerf = benchSync(
    'solid-email compileSync (cached)',
    () =>
      compiled.renderSync({
        preview: marketingProps.preview,
        headline: marketingProps.headline,
        intro: marketingProps.intro,
        ctaHref: marketingProps.ctaHref,
        footerReason: marketingProps.footerReason,
      }),
    WARMUP,
    RUNS,
    ITERATIONS_PER_RUN,
  );
  const afterCachedRenders = takeSnapshot();
  results.push({
    name: 'solid-email compileSync (cached)',
    ...compilePerf,
    memory: {
      heapUsedMB: toMB(afterCachedRenders.heapUsed - baseline.heapUsed),
      rssMB: toMB(afterCachedRenders.rss - baseline.rss),
    },
  });

  // ---- Print memory summary to stderr ----
  console.error('');
  console.error('--- Memory Summary ---');
  console.error(`Baseline heap:       ${toMB(baseline.heapUsed)} MB`);
  console.error(`After renderSync:    ${toMB(afterSync.heapUsed)} MB (+${toMB(afterSync.heapUsed - baseline.heapUsed)} MB)`);
  console.error(`Compile overhead:    ${compileOverheadMB} MB`);
  console.error(`After compile bench: ${toMB(afterCachedRenders.heapUsed)} MB (+${toMB(afterCachedRenders.heapUsed - baseline.heapUsed)} MB total)`);
  console.error('');

  console.log(JSON.stringify(results, null, 2));
}

main();
