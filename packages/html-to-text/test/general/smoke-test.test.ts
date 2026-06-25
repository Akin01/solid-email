import { expect, test } from 'vitest';
import { compile } from '../../src/index';

const defaultConvert = compile();

test('should return empty input unchanged', () => {
  expect(defaultConvert('')).toBe('');
});

test('should return empty result if input undefined', () => {
  // @ts-expect-error Runtime compatibility for untyped JavaScript callers.
  expect(defaultConvert()).toBe('');
});

test('should return plain text (no line breaks) unchanged', () => {
  expect(defaultConvert('Hello world!')).toBe('Hello world!');
});
