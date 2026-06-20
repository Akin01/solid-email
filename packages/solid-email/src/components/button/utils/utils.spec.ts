import { describe, expect, it } from 'vitest';
import { convertToPx, parsePadding } from './parse-padding';
import { pxToPt } from './px-to-pt';

describe('convertToPx', () => {
  it('converts supported units to px', () => {
    expect(convertToPx('10px')).toBe(10);
    expect(convertToPx('2em')).toBe(32);
    expect(convertToPx('1.5rem')).toBe(24);
    expect(convertToPx('50%')).toBe(300);
  });

  it('returns 0 for unsupported or empty values', () => {
    expect(convertToPx('15cm')).toBe(0);
    expect(convertToPx('invalid-format')).toBe(0);
    expect(convertToPx('')).toBe(0);
    expect(convertToPx(undefined)).toBe(0);
  });
});

describe('parsePadding', () => {
  it('parses number input as all paddings', () => {
    expect(parsePadding({ padding: 10 })).toEqual({
      'padding-top': 10,
      'padding-right': 10,
      'padding-bottom': 10,
      'padding-left': 10,
    });
  });

  it('parses one-value padding shorthand', () => {
    expect(parsePadding({ padding: '10px' })).toEqual({
      'padding-top': 10,
      'padding-right': 10,
      'padding-bottom': 10,
      'padding-left': 10,
    });
  });

  it('parses two-value padding shorthand', () => {
    expect(parsePadding({ padding: '10px 2em' })).toEqual({
      'padding-top': 10,
      'padding-right': 32,
      'padding-bottom': 10,
      'padding-left': 32,
    });
  });

  it('parses three-value padding shorthand', () => {
    expect(parsePadding({ padding: '10px 20px 30px' })).toEqual({
      'padding-top': 10,
      'padding-right': 20,
      'padding-bottom': 30,
      'padding-left': 20,
    });
  });

  it('parses four-value padding shorthand', () => {
    expect(parsePadding({ padding: '10px 20px 30px 40px' })).toEqual({
      'padding-top': 10,
      'padding-right': 20,
      'padding-bottom': 30,
      'padding-left': 40,
    });
  });

  it('handles undefined and empty padding input as undefined sides', () => {
    expect(parsePadding({ padding: undefined })).toEqual({
      'padding-top': undefined,
      'padding-right': undefined,
      'padding-bottom': undefined,
      'padding-left': undefined,
    });
    expect(parsePadding({ padding: '' })).toEqual({
      'padding-top': undefined,
      'padding-right': undefined,
      'padding-bottom': undefined,
      'padding-left': undefined,
    });
  });

  it('lets side-specific padding override shorthand values', () => {
    expect(parsePadding({ padding: 10, 'padding-right': '1em' })).toEqual({
      'padding-top': 10,
      'padding-right': 16,
      'padding-bottom': 10,
      'padding-left': 10,
    });
  });

  it('accepts side-specific padding aliases', () => {
    expect(parsePadding({ padding: '4px', paddingRight: '7px' })).toEqual({
      'padding-top': 4,
      'padding-right': 7,
      'padding-bottom': 4,
      'padding-left': 4,
    });
  });
});

describe('pxToPt', () => {
  it('converts px to pt', () => {
    expect(pxToPt(10)).toBe(7.5);
    expect(pxToPt(20)).toBe(15);
    expect(pxToPt(0)).toBe(0);
  });

  it('returns undefined for invalid inputs', () => {
    expect(pxToPt('invalid' as unknown as number)).toBeUndefined();
    expect(pxToPt('' as unknown as number)).toBeUndefined();
    expect(pxToPt(undefined)).toBeUndefined();
  });
});
