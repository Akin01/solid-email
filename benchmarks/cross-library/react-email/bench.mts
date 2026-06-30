/**
 * React-Email benchmark runner
 *
 * Modes:
 *   1. render – async render of static template
 *
 * Memory tracking: measures heap usage before/after renders.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { render } from 'react-email';
import { marketingProps } from '../shared/fixture-data';
import { takeSnapshot, toMB } from '../shared/memory';
import { createReactMarketingEmail } from './template';

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

async function benchAsync(
  _name: string,
  fn: () => Promise<string>,
  warmup: number,
  runs: number,
  iterations: number,
): Promise<{
  avgMs: number;
  minMs: number;
  maxMs: number;
  opsPerSec: number;
  outputBytes: number;
}> {
  for (let i = 0; i < warmup; i++) await fn();

  const times: number[] = [];
  let lastOutput = '';
  for (let r = 0; r < runs; r++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      lastOutput = await fn();
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

async function main() {
  // ---- Render once to verify and save output HTML ----
  const testHtml = await render(createReactMarketingEmail(marketingProps));
  assertIncludes('react-email', testHtml, [
    'Launch Week',
    'Product highlights',
  ]);

  mkdirSync(RESULTS_DIR, { recursive: true });
  writeFileSync(join(RESULTS_DIR, 'react-email.html'), testHtml, 'utf-8');

  // ---- Baseline memory after all imports ----
  const baseline = takeSnapshot();

  const results: BenchResult[] = [];

  // ---- 1. render - static template ----
  const renderPerf = await benchAsync(
    'react-email render',
    async () => render(createReactMarketingEmail(marketingProps)),
    WARMUP,
    RUNS,
    ITERATIONS_PER_RUN,
  );
  const afterRender = takeSnapshot();
  results.push({
    name: 'react-email render',
    ...renderPerf,
    memory: {
      heapUsedMB: toMB(afterRender.heapUsed - baseline.heapUsed),
      rssMB: toMB(afterRender.rss - baseline.rss),
    },
  });

  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
