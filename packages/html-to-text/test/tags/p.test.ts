import { test } from 'vitest';
import { htmlToText } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should separate paragraphs from surrounding content by two linebreaks', () => {
  expectSnapshot({
    convert: htmlToText,
    input: 'text<p>first</p><p>second</p>text',
  });
});

test('should allow to change the number of linebreaks', () => {
  expectSnapshot({
    convert: htmlToText,
    input: 'text<p>first</p><p>second</p>text',
    options: {
      selectors: [
        {
          selector: 'p',
          options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
        },
      ],
    },
  });
});
