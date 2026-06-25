import { test } from 'vitest';
import { htmlToText } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should handle empty unordered lists', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ul></ul>',
  });
});

test('should handle unordered list with multiple elements', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ul><li>foo</li><li>bar</li></ul>',
  });
});

test('should handle unordered list prefix option', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ul><li>foo</li><li>bar</li></ul>',
    options: {
      selectors: [{ selector: 'ul', options: { itemPrefix: ' test ' } }],
    },
  });
});

test('should handle nested unordered lists correctly', () => {
  expectSnapshot({
    convert: htmlToText,
    input:
      /*html*/ '<ul><li>foo<ul><li>bar<ul><li>baz.1</li><li>baz.2</li></ul></li></ul></li></ul>',
  });
});

test('should handle long nested unordered lists correctly', () => {
  expectSnapshot({
    convert: htmlToText,
    input: /*html*/ `<ul>
    <li>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita k a s d g u b e r g r e n, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
    <li>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita k a s d g u b e r g r e n, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
    <li>Inner:
      <ul>
        <li>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita k a s d g u b e r g r e n, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
        <li>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita k a s d g u b e r g r e n, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
      </ul>
    </li>
  </ul>`,
  });
});

test('should handle empty ordered lists', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ol></ol>',
  });
});

test('should handle ordered list with multiple elements', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ol><li>foo</li><li>bar</li></ol>',
  });
});

test('should support ordered list type=1 attribute', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ol type="1"><li>foo</li><li>bar</li></ol>',
  });
});

test('should fallback to type=1 if type attribute is invalid', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ol type="whatever"><li>foo</li><li>bar</li></ol>',
  });
});

test('should support ordered list type=a attribute', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ol type="a"><li>foo</li><li>bar</li></ol>',
  });
});

test('should support ordered list type=A attribute', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ol type="A"><li>foo</li><li>bar</li></ol>',
  });
});

test('should support ordered list type=i attribute', () => {
  const html1 = '<ol type="i"><li>foo</li><li>bar</li></ol>';
  const html2 = '<ol start="8" type="i"><li>foo</li><li>bar</li></ol>';
  expectSnapshot({
    convert: htmlToText,
    input: html1,
    title: 'ordered list type i',
  });
  expectSnapshot({
    convert: htmlToText,
    input: html2,
    title: 'ordered list type i with start',
  });
});

test('should support ordered list type=I attribute', () => {
  const html1 = '<ol type="I"><li>foo</li><li>bar</li></ol>';
  const html2 = '<ol start="8" type="I"><li>foo</li><li>bar</li></ol>';
  expectSnapshot({
    convert: htmlToText,
    input: html1,
    title: 'ordered list type I',
  });
  expectSnapshot({
    convert: htmlToText,
    input: html2,
    title: 'ordered list type I with start',
  });
});

test('should support ordered list start attribute', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ol start="100"><li>foo</li><li>bar</li></ol>',
  });
});

test('should handle nested ordered lists correctly', () => {
  expectSnapshot({
    convert: htmlToText,
    input:
      /*html*/ '<ol><li>foo<ol><li>bar<ol><li>baz</li><li>baz</li></ol></li></ol></li></ol>',
  });
});

test('should handle long nested ordered lists correctly', () => {
  expectSnapshot({
    convert: htmlToText,
    input: /*html*/ `<ol>
    <li>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita k a s d g u b e r g r e n, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
    <li>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita k a s d g u b e r g r e n, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
    <li>Inner:
      <ol>
        <li>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita k a s d g u b e r g r e n, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
        <li>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita k a s d g u b e r g r e n, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
      </ol>
    </li>
  </ol>`,
  });
});

test('should support ordered list type=a attribute past 26 characters', () => {
  const html1 = '<ol start="26" type="a"><li>foo</li><li>bar</li></ol>';
  const html2 = '<ol start="702" type="a"><li>foo</li><li>bar</li></ol>';
  expectSnapshot({
    convert: htmlToText,
    input: html1,
    title: 'ordered list type a past 26',
  });
  expectSnapshot({
    convert: htmlToText,
    input: html2,
    title: 'ordered list type a past 702',
  });
});

test('should support ordered list type=A attribute past 26 characters', () => {
  const html1 = '<ol start="26" type="A"><li>foo</li><li>bar</li></ol>';
  const html2 = '<ol start="702" type="A"><li>foo</li><li>bar</li></ol>';
  expectSnapshot({
    convert: htmlToText,
    input: html1,
    title: 'ordered list type A past 26',
  });
  expectSnapshot({
    convert: htmlToText,
    input: html2,
    title: 'ordered list type A past 702',
  });
});

// HTML standard defines vinculum extension for large numbers (past 3999).
// But that doesn't seem to have any significance for practical purposes.

test('should not wrap list items when wordwrap is disabled', () => {
  expectSnapshot({
    convert: htmlToText,
    input: /*html*/ `Good morning Jacob,
    <p>Lorem ipsum dolor sit amet</p>
    <p><strong>Lorem ipsum dolor sit amet.</strong></p>
    <ul>
      <li>run in the park <span style="color:#888888;">(in progress)</span></li>
    </ul>
  `,
    options: { wordwrap: false },
  });
});

test('should handle non-li elements inside a list gracefully', () => {
  expectSnapshot({
    convert: htmlToText,
    input: /*html*/ `
    <ul>
      <li>list item</li>
      plain text
      <li>list item</li>
      <div>div</div>
      <li>list item</li>
      <p>paragraph</p>
      <li>list item</li>
    </ul>
  `,
  });
});
