import { describe, expect, it } from 'vitest';
import { computeMargins } from './compute-margins';

describe('computeMargins', () => {
  it('works with numeric and text margin shorthands', () => {
    expect(computeMargins({ margin: 24 })).toEqual({
      'margin-top': 24,
      'margin-right': 24,
      'margin-bottom': 24,
      'margin-left': 24,
    });

    expect(computeMargins({ margin: '24px' })).toEqual({
      'margin-top': '24px',
      'margin-right': '24px',
      'margin-bottom': '24px',
      'margin-left': '24px',
    });

    expect(computeMargins({ margin: '24px', 'margin-top': 10 })).toEqual({
      'margin-top': 10,
      'margin-right': '24px',
      'margin-bottom': '24px',
      'margin-left': '24px',
    });
  });

  it('computes margins according to style insertion order', () => {
    expect(computeMargins({ margin: 0, 'margin-bottom': '1rem' })).toEqual({
      'margin-top': 0,
      'margin-right': 0,
      'margin-left': 0,
      'margin-bottom': '1rem',
    });

    expect(computeMargins({ 'margin-bottom': '1rem', margin: 0 })).toEqual({
      'margin-top': 0,
      'margin-right': 0,
      'margin-left': 0,
      'margin-bottom': 0,
    });

    expect(
      computeMargins({
        'margin-top': '2rem',
        'margin-left': '10px',
        margin: '3em',
        'margin-right': '9px',
        'margin-bottom': '1px',
      }),
    ).toEqual({
      'margin-top': '3em',
      'margin-left': '3em',
      'margin-right': '9px',
      'margin-bottom': '1px',
    });
  });

  it('accepts side-specific margin aliases', () => {
    expect(computeMargins({ margin: 0, marginTop: '2px' })).toEqual({
      'margin-top': '2px',
      'margin-right': 0,
      'margin-bottom': 0,
      'margin-left': 0,
    });
  });
});
