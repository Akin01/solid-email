/**
 * Aggregates benchmark results from all libraries and displays a comparison table.
 * Includes performance, memory usage, and pairwise conformance metrics.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkConformance } from './shared/validate';

interface BenchResult {
  name: string;
  avgMs: number;
  minMs: number;
  maxMs: number;
  opsPerSec: number;
  outputBytes: number;
  memory?: {
    heapUsedMB: number;
    rssMB: number;
  };
}

function loadResults(file: string): BenchResult[] {
  try {
    const raw = readFileSync(join('results', file), 'utf-8');
    return JSON.parse(raw);
  } catch {
    console.error(`  Failed to load ${file}`);
    return [];
  }
}

function loadHtml(file: string): string | null {
  try {
    return readFileSync(join('results', file), 'utf-8');
  } catch {
    return null;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatMs(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)} us`;
  return `${ms.toFixed(2)} ms`;
}

function formatMB(mb: number): string {
  if (mb < 0.01) return '<0.01 MB';
  return `${mb.toFixed(2)} MB`;
}

function main() {
  const solid = loadResults('solid.json');
  const jsx = loadResults('jsx-email.json');
  const react = loadResults('react-email.json');
  const mjml = loadResults('mjml-react.json');

  const all = [...solid, ...jsx, ...react, ...mjml];

  if (all.length === 0) {
    console.error('No benchmark results found.');
    process.exit(1);
  }

  // ---- Pairwise conformance from HTML files ----
  const htmlFiles: Record<string, string> = {};
  for (const name of ['solid', 'jsx-email', 'react-email', 'mjml-react']) {
    const html = loadHtml(`${name}.html`);
    if (html) htmlFiles[name] = html;
  }

  const libNames = Object.keys(htmlFiles);
  const pairwiseScores: Record<string, Record<string, number>> = {};

  for (const a of libNames) {
    pairwiseScores[a] = {};
    for (const b of libNames) {
      if (a === b) {
        pairwiseScores[a][b] = 100;
      } else if (pairwiseScores[b]?.[a] !== undefined) {
        pairwiseScores[a][b] = pairwiseScores[b][a];
      } else {
        pairwiseScores[a][b] = checkConformance(
          htmlFiles[a],
          htmlFiles[b],
        ).score;
      }
    }
  }

  // Average conformance per library
  const avgConformance: Record<string, number> = {};
  for (const a of libNames) {
    const scores = libNames
      .filter((b) => b !== a)
      .map((b) => pairwiseScores[a][b]);
    avgConformance[a] =
      scores.length > 0
        ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length)
        : 100;
  }

  // ---- Find baseline (react-email render) ----
  const baseline = all.find((r) => r.name === 'react-email render') ?? all[0];

  // ---- Print table ----
  console.log('');
  console.log(
    '╔═══════════════════════════════════════════════════════════════════════════════════════════════════════╗',
  );
  console.log(
    '║                                 EMAIL RENDERER BENCHMARK RESULTS                                     ║',
  );
  console.log(
    '╚═══════════════════════════════════════════════════════════════════════════════════════════════════════╝',
  );
  console.log('');
  console.log(
    'Template:  Marketing email with hero, features, products, release notes, footer',
  );
  console.log(
    'Conform:   Pairwise — each library compared against all others, score = average',
  );
  console.log('Config:    50 iterations × 10 runs, 3 warmup runs');
  console.log('');

  // Table header
  const c1 = 38; // Library / Mode
  const c2 = 11; // Avg Time
  const c3 = 9; // Min
  const c4 = 9; // Max
  const c5 = 9; // Ops/sec
  const c6 = 10; // Output
  const c7 = 10; // Heap Δ
  const c8 = 12; // Conformance
  const c9 = 14; // vs Base

  const header = [
    'Library / Mode'.padEnd(c1),
    'Avg'.padStart(c2),
    'Min'.padStart(c3),
    'Max'.padStart(c4),
    'Ops/s'.padStart(c5),
    'Output'.padStart(c6),
    'Heap Δ'.padStart(c7),
    'Conform'.padStart(c8),
    'vs react'.padStart(c9),
  ].join(' │ ');

  const divider = [
    '─'.repeat(c1),
    '─'.repeat(c2),
    '─'.repeat(c3),
    '─'.repeat(c4),
    '─'.repeat(c5),
    '─'.repeat(c6),
    '─'.repeat(c7),
    '─'.repeat(c8),
    '─'.repeat(c9),
  ].join('─┼─');

  console.log(header);
  console.log(divider);

  for (const r of all) {
    const ratio = baseline.avgMs / r.avgMs;
    const ratioStr =
      ratio >= 1
        ? `${ratio.toFixed(1)}× faster`
        : `${(1 / ratio).toFixed(1)}× slower`;
    const memStr = r.memory ? formatMB(r.memory.heapUsedMB) : 'n/a';

    // Map result name to lib key for conformance lookup
    const libKey = r.name.startsWith('solid')
      ? 'solid'
      : r.name.startsWith('jsx')
        ? 'jsx-email'
        : r.name.startsWith('react')
          ? 'react-email'
          : r.name.startsWith('mjml')
            ? 'mjml-react'
            : '';
    const conformScore = avgConformance[libKey] ?? 0;
    const conformStr = conformScore > 0 ? `${conformScore}%` : 'n/a';

    const row = [
      r.name.padEnd(c1),
      formatMs(r.avgMs).padStart(c2),
      formatMs(r.minMs).padStart(c3),
      formatMs(r.maxMs).padStart(c3),
      r.opsPerSec.toFixed(0).padStart(c5),
      formatBytes(r.outputBytes).padStart(c6),
      memStr.padStart(c7),
      conformStr.padStart(c8),
      ratioStr.padStart(c9),
    ].join(' │ ');
    console.log(row);
  }

  console.log('');
  console.log('─'.repeat(c1 + c2 + c3 * 2 + c5 + c6 + c7 + c8 + c9 + 25));
  console.log('');

  // ---- Summary ----
  const fastest = all.reduce((a, b) => (a.avgMs < b.avgMs ? a : b));
  const renderSyncMode = all.find((r) => r.name === 'solid-email renderSync');
  const compileMode = all.find((r) => r.name.includes('compile'));

  console.log('Performance:');
  console.log(
    `  Fastest:        ${fastest.name} (${formatMs(fastest.avgMs)}/render, ${fastest.opsPerSec.toFixed(0)} ops/sec)`,
  );
  if (renderSyncMode && baseline) {
    const ratio = baseline.avgMs / renderSyncMode.avgMs;
    console.log(
      `  Solid vs React: ${ratio.toFixed(1)}× faster (renderSync vs render)`,
    );
  }
  if (compileMode && renderSyncMode) {
    const speedup = renderSyncMode.avgMs / compileMode.avgMs;
    console.log(
      `  Compile mode:   ${speedup.toFixed(0)}× faster than renderSync (cached render)`,
    );
  }
  console.log('');

  console.log('Memory (heap delta from baseline):');
  for (const r of all) {
    if (r.memory) {
      console.log(
        `  ${r.name.padEnd(38)} +${formatMB(r.memory.heapUsedMB).padStart(8)} heap`,
      );
    }
  }
  console.log('');

  // ---- Conformance matrix ----
  if (libNames.length >= 2) {
    console.log(
      'Pairwise conformance matrix (score = % text/links/images match):',
    );
    console.log('');

    const labelW = 14;
    const colW = 8;
    const matrixHeader =
      ''.padEnd(labelW) + libNames.map((n) => n.padStart(colW)).join(' ');
    console.log(matrixHeader);
    console.log('─'.repeat(labelW + libNames.length * (colW + 1)));

    for (const a of libNames) {
      const cells = libNames.map((b) => {
        if (a === b) return '—'.padStart(colW);
        return `${pairwiseScores[a][b]}%`.padStart(colW);
      });
      console.log(a.padEnd(labelW) + cells.join(' '));
    }

    console.log('');
    console.log('Average conformance per library:');
    for (const lib of libNames) {
      console.log(`  ${lib.padEnd(14)} ${avgConformance[lib]}%`);
    }
    console.log('');
  }

  // ---- Compile memory analysis ----
  if (compileMode && renderSyncMode) {
    const compileMem = compileMode.memory?.heapUsedMB ?? 0;
    const syncMem = renderSyncMode.memory?.heapUsedMB ?? 0;
    console.log('Cache memory analysis:');
    console.log(`  renderSync heap overhead:     ${formatMB(syncMem)}`);
    console.log(`  compileSync heap overhead:    ${formatMB(compileMem)}`);
    if (compileMem > 0 && syncMem > 0) {
      const ratio = compileMem / syncMem;
      console.log(
        `  compileSync uses ${ratio.toFixed(1)}× ${ratio > 1 ? 'more' : 'less'} heap than renderSync`,
      );
    }
    console.log(
      '  Note: compileSync stores the pre-compiled template in memory.',
    );
    console.log('        This cost is one-time; repeated renders reuse it.');
    console.log('');
  }

  // ---- Methodology notes ----
  console.log('Methodology notes:');
  console.log(
    '  • solid-email runs under vite-node (requires Solid JSX transform plugin).',
  );
  console.log(
    '    All other libraries run under tsx (plain esbuild). This is inherent to',
  );
  console.log(
    '    the Solid ecosystem and cannot be changed without altering the Solid benchmark.',
  );
  console.log(
    '  • solid-email offers sync rendering (benchSync); React-based libraries use',
  );
  console.log(
    '    async rendering (benchAsync with await). The benchmark measures what users',
  );
  console.log(
    '    actually experience — solid users get sync, React users get async.',
  );
  console.log(
    '  • Conformance is pairwise: each library is compared against every other',
  );
  console.log(
    "    library's rendered HTML. The score is the average match percentage.",
  );
  console.log('    No library is the reference standard.');
  console.log('');
}

main();
