import { expect, test } from 'vitest';
import { convert } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should not preserve newlines by default', () => {
  expectSnapshot({
    convert: convert,
    input: '<p\n>One\nTwo\nThree</p>',
  });
});

test('should preserve newlines when provided with a truthy value', () => {
  expectSnapshot({
    convert: convert,
    input: '<p\n>One\nTwo\nThree</p>',
    options: { preserveNewlines: true },
  });
});

test('should preserve line feeds in a long wrapping string containing line feeds', () => {
  expectSnapshot({
    convert: convert,
    input:
      '<p>If a word with a line feed exists over the line feed boundary then\nyou\nmust\nrespect it.</p>',
    options: { preserveNewlines: true },
  });
});

test('should preserve line feeds in a long string containing line feeds across the wrap', () => {
  expectSnapshot({
    convert: convert,
    input:
      '<p>If a word with a line feed exists over the line feed boundary then\nyou must respect it.</p>',
    options: { preserveNewlines: true },
  });
});

test('should preserve line feeds in a long string containing line feeds across the wrap with a line feed before 80 chars', () => {
  expectSnapshot({
    convert: convert,
    input:
      '<p>This string is meant to test if a string is split properly across a\nnewlineandlongword with following text.</p>',
    options: { preserveNewlines: true },
  });
});

test('should preserve line feeds in a long string containing line feeds across the wrap with a line feed after 80 chars', () => {
  expectSnapshot({
    convert: convert,
    input:
      '<p>This string is meant to test if a string is split properly across anewlineandlong\nword with following text.</p>',
    options: { preserveNewlines: true },
  });
});

test('should split long lines', () => {
  expectSnapshot({
    convert: convert,
    input:
      '<p>If a word with a line feed exists over the line feed boundary then you must respect it.</p>',
    options: { preserveNewlines: true },
  });
});

test('should remove spaces if they occur around line feed', () => {
  expectSnapshot({
    convert: convert,
    input:
      '<p>A string of text\nwith \nmultiple\n spaces   \n   that \n \n can be safely removed.</p>',
    options: { preserveNewlines: true },
  });
});

test('should remove spaces if they occur around line feed 2', () => {
  expectSnapshot({
    convert: convert,
    input: 'multiple\n spaces',
    options: { preserveNewlines: true },
  });
});

test('should produce equal results regardless of newline position between blocks', () => {
  const newlineOutside = '<p>A</p>\n<p>B</p>';
  const newlineInside = '<p>A</p><p>\nB</p>';
  const r1 = convert(newlineOutside, { preserveNewlines: true });
  const r2 = convert(newlineInside, { preserveNewlines: true });
  expect(r1).toBe(r2);
});

test('should produce equal results for preserved newlines and BR tags', () => {
  const nlHtml = '<p>A</p>\n<p>B</p><p>\nC</p>';
  const brHtml = '<p>A</p><br/><p>B</p><p><br/>C</p>';
  const nlResult = convert(nlHtml, { preserveNewlines: true });
  const brResult = convert(brHtml);
  expect(nlResult).toBe(brResult);
});

test('should account for trailing/leading linebreaks of adjacent blocks equally', () => {
  expectSnapshot({
    convert: convert,
    input: '<p>A</p>\n<div>B</div>\n<div>C</div>\n<p>D</p>',
    options: { preserveNewlines: true },
  });
});

test('should work with multiple linebreaks and in presence of whitespaces', () => {
  expectSnapshot({
    convert: convert,
    input: '<p>A</p> \n \n <p>B</p>',
    options: { preserveNewlines: true },
  });
});

test('should have no special behavior in presence of words among linebreaks', () => {
  expectSnapshot({
    convert: convert,
    input: '<p>A</p> \n B \n <p>C</p>',
    options: { preserveNewlines: true },
  });
});
