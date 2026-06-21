export const DEFAULT_TIME_MS = 1_000;
export const DEFAULT_WARMUP_MS = 250;
export const DEFAULT_ITERATIONS = 3;

export function readPositiveNumber(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Expected ${name} to be a positive number`);
  }
  return value;
}

export function benchmarkOptions() {
  return {
    time: readPositiveNumber('BENCH_TIME_MS', DEFAULT_TIME_MS),
    warmupTime: readPositiveNumber('BENCH_WARMUP_MS', DEFAULT_WARMUP_MS),
  };
}
export function iterationBenchmarkOptions(iterations = DEFAULT_ITERATIONS) {
  return {
    iterations: readPositiveNumber('BENCH_ITERATIONS', iterations),
    time: 0,
    warmupIterations: 0,
    warmupTime: 0,
  };
}

export function logBenchmarkSettings(
  options:
    | { time: number; warmupTime: number }
    | {
        iterations: number;
        time: number;
        warmupIterations: number;
        warmupTime: number;
      },
) {
  if ('iterations' in options) {
    console.log(
      `Run settings: iterations=${options.iterations}; time=${options.time}ms; warmup-time=${options.warmupTime}ms; warmup-iterations=${options.warmupIterations}`,
    );
    return;
  }

  console.log(
    `Run settings: time=${options.time}ms; warmup-time=${options.warmupTime}ms`,
  );
}

export function assertIncludes(
  label: string,
  output: string,
  expectedValues: string[],
): void {
  for (const expected of expectedValues) {
    if (!output.includes(expected)) {
      throw new Error(`${label} output is missing ${expected}`);
    }
  }
}

export function logFixtureBytes(sizes: Record<string, string | number>) {
  const message = Object.entries(sizes)
    .map(([name, bytes]) => `${name}=${bytes}`)
    .join('; ');
  console.log(`Fixture bytes: ${message}`);
}
