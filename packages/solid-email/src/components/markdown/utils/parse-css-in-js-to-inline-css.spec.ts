import { describe, expect, it } from 'vitest';
import { parseCssInJsToInlineCss } from './parse-css-in-js-to-inline-css';

describe('parseCssInJsToInlineCss', () => {
  it('returns an empty string for undefined styles', () => {
    expect(parseCssInJsToInlineCss(undefined)).toBe('');
  });

  it('serializes kebab-case properties', () => {
    expect(parseCssInJsToInlineCss({ 'font-family': 'serif' })).toBe(
      'font-family:serif',
    );
  });

  it('appends px to numeric values of numerical properties', () => {
    expect(parseCssInJsToInlineCss({ 'font-size': 16 })).toBe('font-size:16px');
  });

  it('joins multiple declarations with semicolons', () => {
    expect(parseCssInJsToInlineCss({ color: 'red', 'font-size': 16 })).toBe(
      'color:red;font-size:16px',
    );
  });

  it('normalizes camelCase properties before serializing', () => {
    expect(
      parseCssInJsToInlineCss({
        backgroundColor: '#fff',
        fontSize: 16,
        lineHeight: 1.5,
      }),
    ).toBe('background-color:#fff;font-size:16px;line-height:1.5');
  });

  it('escapes double quotes so they do not break the style attribute', () => {
    const result = parseCssInJsToInlineCss({
      'font-family': '"Times New Roman", serif',
    });

    expect(result).toBe('font-family:&quot;Times New Roman&quot;, serif');
    expect(result).not.toContain('"');
    expect(result).not.toContain('&#x27;');
  });
});
