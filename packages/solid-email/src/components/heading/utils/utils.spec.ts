import { describe, expect, it } from 'vitest';
import { withMargin, withSpace } from './spaces';

describe('withMargin', () => {
  it('returns an empty object for empty input', () => {
    expect(withMargin({})).toEqual({});
  });

  it('applies margin to the top', () => {
    expect(withMargin({ mt: '10' })).toEqual({ 'margin-top': '10px' });
  });

  it('applies margin to the left and right', () => {
    expect(withMargin({ mx: '20' })).toEqual({
      'margin-left': '20px',
      'margin-right': '20px',
    });
  });

  it('applies margin to the top and bottom', () => {
    expect(withMargin({ my: '15' })).toEqual({
      'margin-bottom': '15px',
      'margin-top': '15px',
    });
  });

  it('applies margin to all sides', () => {
    expect(withMargin({ m: '25' })).toEqual({ margin: '25px' });
  });

  it('applies margin to specified sides when provided', () => {
    expect(withMargin({ mt: '5', mr: '10', mb: '15', ml: '20' })).toEqual({
      'margin-bottom': '15px',
      'margin-left': '20px',
      'margin-right': '10px',
      'margin-top': '5px',
    });
  });

  it('ignores invalid margin values', () => {
    expect(withMargin({ m: 'invalid', mt: '5', mx: 'valid' })).toEqual({
      'margin-top': '5px',
    });
  });
});

describe('withSpace', () => {
  it('returns undefined for undefined value', () => {
    expect(withSpace(undefined)).toBeUndefined();
  });

  it('appends px to valid numeric values', () => {
    expect(withSpace(15)).toBe('15px');
    expect(withSpace('15')).toBe('15px');
  });

  it('returns undefined for invalid values', () => {
    expect(withSpace('invalid')).toBeUndefined();
  });
});
