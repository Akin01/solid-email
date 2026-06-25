import { test } from 'vitest';
import { htmlToText } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should decode html attribute entities from href', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="/foo?a&#x3D;b">test</a>',
  });
});

test('should not insert null bytes', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="some-url?a=b&amp;b=c">Testing &amp; Done</a>',
  });
});

test('should update relatively sourced links with baseUrl', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="/test.html">test</a>',
    options: {
      selectors: [
        { selector: 'a', options: { baseUrl: 'https://example.com' } },
      ],
    },
  });
});

test('should strip mailto from email links', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="mailto:foo@example.com">email me</a>',
  });
});

test('should return link with brackets by default', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="http://my.link">test</a>',
  });
});

test('should return link without brackets if linkBrackets is false', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="http://my.link">test</a>',
    options: {
      selectors: [{ selector: 'a', options: { linkBrackets: false } }],
    },
  });
});

test('should return link without brackets if linkBrackets is ["", ""]', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="http://my.link">test</a>',
    options: {
      selectors: [{ selector: 'a', options: { linkBrackets: ['', ''] } }],
    },
  });
});

test('should return link with custom brackets', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="http://my.link">test</a>',
    options: {
      selectors: [
        { selector: 'a', options: { linkBrackets: ['===> ', ' <==='] } },
      ],
    },
  });
});

test('should not return link for anchor if noAnchorUrl is true', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="#link">test</a>',
    options: {
      selectors: [{ selector: 'a', options: { noAnchorUrl: true } }],
    },
  });
});

test('should return link for anchor if noAnchorUrl is false', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="#link">test</a>',
    options: {
      selectors: [{ selector: 'a', options: { noAnchorUrl: false } }],
    },
  });
});

test('should not uppercase links inside headings', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<h1><a href="http://example.com">Heading</a></h1>',
  });
});

test('should not uppercase links inside table header cells', () => {
  expectSnapshot({
    convert: htmlToText,
    input: /*html*/ `
    <table>
      <tr>
        <th>Header cell 1</th>
        <th><a href="http://example.com">Header cell 2</a></th>
        <td><a href="http://example.com">Regular cell</a></td>
      </tr>
    </table>
  `,
    options: {
      selectors: [{ selector: 'table', format: 'dataTable' }],
    },
  });
});

test('should rewrite link href path with provided metadata', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<a href="/test.html">test</a>',
    metadata: { path: '/foo/bar' },
    options: {
      selectors: [
        {
          selector: 'a',
          options: {
            baseUrl: 'https://example.com',
            pathRewrite: (path, meta) => {
              if (
                typeof meta !== 'object' ||
                meta === null ||
                !('path' in meta) ||
                typeof meta.path !== 'string'
              ) {
                throw new Error('Expected metadata.path to be a string');
              }
              return meta.path + path;
            },
          },
        },
      ],
    },
  });
});
