import { expect, test } from 'vitest';
import { compile, convert } from '../../src/index';

const defaultConvert = compile();

test('should not be ignored inside a whitespace-only node', () => {
  const html = 'foo<span> </span>bar';
  const expected = 'foo bar';
  expect(defaultConvert(html)).toBe(expected);
});

test('should handle html character entities for html whitespace characters', () => {
  const html = /*html*/ `a<span>&#x0020;</span>b<span>&Tab;</span>c<span>&NewLine;</span>d<span>&#10;</span>e`;
  const expected = 'a b c d e';
  expect(defaultConvert(html)).toBe(expected);
});

test('should not add additional whitespace after sup', () => {
  const html = '<p>This text contains <sup>superscript</sup> text.</p>';
  const options = { preserveNewlines: true };
  const expected = 'This text contains superscript text.';
  expect(convert(html, options)).toBe(expected);
});

test('should handle custom whitespace characters', () => {
  // No-Break Space - decimal 160, hex \u00a0.
  const html = /*html*/ `<span>first span\u00a0</span>&nbsp;<span>&#160;last span</span>`;
  const expectedDefault = 'first span\u00a0\u00a0\u00a0last span';
  expect(defaultConvert(html)).toBe(expectedDefault);

  const options = { whitespaceCharacters: ' \t\r\n\f\u200b\u00a0' };
  const expectedCustom = 'first span last span';
  expect(convert(html, options)).toBe(expectedCustom);
});

test('should handle space and newline combination', () => {
  const html = '<span>foo</span> \n<span>bar</span>\n <span>baz</span>';
  const expectedDefault = 'foo bar baz';
  expect(defaultConvert(html)).toBe(expectedDefault);

  const expectedCustom = 'foo\nbar\nbaz';
  expect(convert(html, { preserveNewlines: true })).toBe(expectedCustom);
});

test('should not have extra spaces at beginning for space-indented html', () => {
  const html = /*html*/ `<html>
<body>
    <p>foo</p>
    <p>bar</p>
</body>
</html>`;
  const expected = 'foo\n\nbar';
  expect(defaultConvert(html)).toBe(expected);
});
