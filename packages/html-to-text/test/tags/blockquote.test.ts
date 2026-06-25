import { test } from 'vitest';
import { htmlToText } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should handle format single-line blockquote', () => {
  const html = 'foo<blockquote>test</blockquote>bar';
  expectSnapshot({
    convert: htmlToText,
    input: html,
    title: 'single-line blockquote',
  });
});

test('should format multi-line blockquote', () => {
  const html = '<blockquote>a<br/>b</blockquote>';
  expectSnapshot({
    convert: htmlToText,
    input: html,
    title: 'multi-line blockquote',
  });
});

test('should trim newlines unless disabled', () => {
  const html = '<blockquote><br/>a<br/><br/><br/></blockquote>';
  const options = {
    selectors: [{ selector: 'blockquote', options: { trimEmptyLines: false } }],
  };
  expectSnapshot({
    convert: htmlToText,
    input: html,
    title: 'blockquote default trim',
  });
  expectSnapshot({
    convert: htmlToText,
    input: html,
    options: options,
    title: 'blockquote trim disabled',
  });
});
