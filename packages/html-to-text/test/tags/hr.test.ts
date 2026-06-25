import { test } from 'vitest';
import { htmlToText } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should output horizontal line of default length', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<div>foo</div><hr/><div>bar</div>',
  });
});

test('should output horizontal line of specific length', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<div>foo</div><hr/><div>bar</div>',
    options: {
      selectors: [{ selector: 'hr', options: { length: 30 } }],
    },
  });
});

test('should output horizontal line of length 40 when wordwrap is disabled', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<div>foo</div><hr/><div>bar</div>',
    options: { wordwrap: false },
  });
});
