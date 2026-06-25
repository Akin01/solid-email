import { afterEach, expect, test, vi } from 'vitest';

import { convert } from '../../src/index';

afterEach(() => {
  vi.restoreAllMocks();
});

test('should respect default limit of maxInputLength', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const html = '0123456789'.repeat(2000000);
  const options = { wordwrap: false } as const;
  expect(convert(html, options).length).toBe(1 << 24);
  expect(warn).toHaveBeenCalledWith(
    'Input length 20000000 is above allowed limit of 16777216. Truncating without ellipsis.',
  );
});

test('should respect custom maxInputLength', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const html = '0123456789'.repeat(2000000);
  const options = { limits: { maxInputLength: 42 } };
  expect(convert(html, options).length).toBe(42);
  expect(warn).toHaveBeenCalledWith(
    'Input length 20000000 is above allowed limit of 42. Truncating without ellipsis.',
  );
});
