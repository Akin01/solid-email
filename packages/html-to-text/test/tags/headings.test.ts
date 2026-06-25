import { test } from 'vitest';
import { htmlToText } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should allow to disable uppercased headings', () => {
  const html = /*html*/ `
    <h1>Heading 1</h1>
    <h2>heading 2</h2>
    <h3>heading 3</h3>
    <h4>heading 4</h4>
    <h5>heading 5</h5>
    <h6>heading 6</h6>
  `;

  const options = {
    selectors: [
      { selector: 'h1', options: { uppercase: false } },
      { selector: 'h2', options: { uppercase: false } },
      { selector: 'h3', options: { uppercase: false } },
      { selector: 'h4', options: { uppercase: false } },
      { selector: 'h5', options: { uppercase: false } },
      { selector: 'h6', options: { uppercase: false } },
    ],
  };

  expectSnapshot({
    convert: htmlToText,
    input: html,
    title: 'uppercase headings by default',
  });
  expectSnapshot({
    convert: htmlToText,
    input: html,
    options: options,
    title: 'custom lowercase headings',
  });
});
