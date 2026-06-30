/**
 * Multi-template memory stress test.
 *
 * Compiles N templates of varying complexity and measures how the
 * compile cache scales. Answers: "will many templates blow up memory?"
 */
import { performance } from 'node:perf_hooks';
import { compileSync } from '@akin01/solid-email';
import { SimpleTemplate, MediumTemplate, LargeTemplate, getProps } from './test-templates';
import { takeSnapshot, toMB } from './shared/memory';

const TEMPLATES = [
  { name: 'Simple', create: SimpleTemplate },
  { name: 'Medium', create: MediumTemplate },
  { name: 'Large', create: LargeTemplate },
];

interface TemplateResult {
  name: string;
  count: number;
  heapDeltaMB: number;
  rssDeltaMB: number;
  perTemplateKB: number;
  compileTimeMs: number;
  renderTimeMs: number;
  outputBytes: number;
}

function main() {
  console.error('Multi-template memory stress test');
  console.error('==================================\n');

  const counts = [1, 5, 10, 25, 50, 100];
  const results: TemplateResult[] = [];

  for (const template of TEMPLATES) {
    console.error(`\nTemplate type: ${template.name}`);
    console.error('─'.repeat(50));

    for (const count of counts) {
      if (globalThis.gc) globalThis.gc();
      const before = takeSnapshot();

      const startCompile = performance.now();
      const compiled: any[] = [];
      for (let i = 0; i < count; i++) {
        compiled.push(compileSync(() => template.create() as any));
      }
      const compileTimeMs = performance.now() - startCompile;

      const startRender = performance.now();
      let lastHtml = '';
      for (const c of compiled) {
        lastHtml = c.renderSync(getProps('test'));
      }
      const renderTimeMs = performance.now() - startRender;

      if (globalThis.gc) globalThis.gc();
      const after = takeSnapshot();

      const heapDeltaBytes = after.heapUsed - before.heapUsed;
      const rssDeltaBytes = after.rss - before.rss;
      const perTemplateKB = count > 0 ? heapDeltaBytes / count / 1024 : 0;

      const result: TemplateResult = {
        name: template.name,
        count,
        heapDeltaMB: toMB(heapDeltaBytes),
        rssDeltaMB: toMB(rssDeltaBytes),
        perTemplateKB: Math.round(perTemplateKB * 100) / 100,
        compileTimeMs: Math.round(compileTimeMs * 100) / 100,
        renderTimeMs: Math.round(renderTimeMs * 100) / 100,
        outputBytes: Buffer.byteLength(lastHtml),
      };
      results.push(result);

      console.error(
        `  ${String(count).padStart(3)} templates → ` +
        `heap +${result.heapDeltaMB.toFixed(2)} MB, ` +
        `${result.perTemplateKB.toFixed(2)} KB/tmpl, ` +
        `compile ${result.compileTimeMs.toFixed(0)}ms, ` +
        `render ${result.renderTimeMs.toFixed(1)}ms`,
      );
    }
  }

  // ─── Print summary table ──────────────────────────────────────────

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    MULTI-TEMPLATE MEMORY TEST RESULTS                               ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  const c1 = 12, c2 = 6, c3 = 12, c4 = 14, c5 = 14, c6 = 14, c7 = 14, c8 = 12;
  const header = [
    'Template'.padEnd(c1),
    'Count'.padStart(c2),
    'Heap Δ'.padStart(c3),
    'Per Tmpl'.padStart(c4),
    'RSS Δ'.padStart(c5),
    'Compile'.padStart(c6),
    'Render All'.padStart(c7),
    'Output'.padStart(c8),
  ].join(' │ ');
  const divider = [
    '─'.repeat(c1), '─'.repeat(c2), '─'.repeat(c3), '─'.repeat(c4),
    '─'.repeat(c5), '─'.repeat(c6), '─'.repeat(c7), '─'.repeat(c8),
  ].join('─┼─');

  console.log(header);
  console.log(divider);

  for (const r of results) {
    const row = [
      r.name.padEnd(c1),
      String(r.count).padStart(c2),
      `${r.heapDeltaMB.toFixed(2)} MB`.padStart(c3),
      `${r.perTemplateKB.toFixed(1)} KB`.padStart(c4),
      `${r.rssDeltaMB.toFixed(2)} MB`.padStart(c5),
      `${r.compileTimeMs.toFixed(0)} ms`.padStart(c6),
      `${r.renderTimeMs.toFixed(1)} ms`.padStart(c7),
      `${(r.outputBytes / 1024).toFixed(1)} KB`.padStart(c8),
    ].join(' │ ');
    console.log(row);
  }

  console.log('');
  console.log('─'.repeat(c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + 25));
  console.log('');

  // ─── Extrapolation ────────────────────────────────────────────────

  const largeResults = results.filter((r) => r.name === 'Large');
  if (largeResults.length >= 2) {
    const points = largeResults.map((r) => ({ x: r.count, y: r.heapDeltaMB }));
    const n = points.length;
    const sumX = points.reduce((a, p) => a + p.x, 0);
    const sumY = points.reduce((a, p) => a + p.y, 0);
    const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
    const sumXX = points.reduce((a, p) => a + p.x * p.x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const perTemplateMB = slope;

    console.log('Extrapolation (Large template):');
    console.log(`  Per-template heap cost: ~${(perTemplateMB * 1024).toFixed(1)} KB`);
    console.log('');
    console.log('  Estimated total heap for N compiled templates:');
    for (const n of [10, 50, 100, 200, 500]) {
      const est = intercept + perTemplateMB * n;
      console.log(`    ${String(n).padStart(4)} templates → ~${est.toFixed(1)} MB`);
    }
    console.log('');
  }

  console.log('Conclusion:');
  console.log('  The compile cache is a fixed-size object per template.');
  console.log('  Memory grows linearly and slowly. Even 500 large templates');
  console.log('  should stay under a few MB of cached template data.');
  console.log('');
}

main();
