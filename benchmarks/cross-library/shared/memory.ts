/**
 * Memory measurement utilities for benchmarks.
 */
import { memoryUsage } from 'node:process';

export interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
}

export interface MemoryResult {
  heapUsedMB: number;
  rssMB: number;
  externalMB: number;
}

export function takeSnapshot(): MemorySnapshot {
  // Force GC if available (requires --expose-gc)
  if (globalThis.gc) globalThis.gc();
  const m = memoryUsage();
  return {
    heapUsed: m.heapUsed,
    heapTotal: m.heapTotal,
    rss: m.rss,
    external: m.external,
  };
}

export function toMB(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

/**
 * Measure memory overhead of a function call.
 * Returns the heap delta after running fn() compared to before.
 */
export function measureMemoryOverhead(fn: () => void): {
  before: MemoryResult;
  after: MemoryResult;
  delta: MemoryResult;
} {
  if (globalThis.gc) globalThis.gc();
  const before = takeSnapshot();
  fn();
  if (globalThis.gc) globalThis.gc();
  const after = takeSnapshot();
  return {
    before: {
      heapUsedMB: toMB(before.heapUsed),
      rssMB: toMB(before.rss),
      externalMB: toMB(before.external),
    },
    after: {
      heapUsedMB: toMB(after.heapUsed),
      rssMB: toMB(after.rss),
      externalMB: toMB(after.external),
    },
    delta: {
      heapUsedMB: toMB(after.heapUsed - before.heapUsed),
      rssMB: toMB(after.rss - before.rss),
      externalMB: toMB(after.external - before.external),
    },
  };
}
