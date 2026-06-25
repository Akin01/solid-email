import { test } from 'vitest';
import { htmlToText } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should replace entities inside alt attributes of images', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<img src="test.png" alt="&quot;Awesome&quot;">',
  });
});

test('should update relatively sourced images with baseUrl', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<img src="/test.png">',
    options: {
      selectors: [
        { selector: 'img', options: { baseUrl: 'https://example.com' } },
      ],
    },
  });
});

test('should return image link without brackets if linkBrackets is false', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<img src="test.png" alt="Awesome">',
    options: {
      selectors: [{ selector: 'img', options: { linkBrackets: false } }],
    },
  });
});

test('should return image link without brackets if linkBrackets is ["", ""]', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<img src="test.png" alt="Awesome">',
    options: {
      selectors: [{ selector: 'img', options: { linkBrackets: ['', ''] } }],
    },
  });
});

test('should return image link with custom brackets', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<img src="test.png" alt="Awesome">',
    options: {
      selectors: [
        { selector: 'img', options: { linkBrackets: ['===> ', ' <==='] } },
      ],
    },
  });
});

test('should rewrite image source path with provided metadata', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<img src="pictures/test.png">',
    metadata: { assetsPath: 'assets/' },
    options: {
      selectors: [
        {
          selector: 'img',
          options: {
            pathRewrite: (path, meta) => {
              if (
                typeof meta !== 'object' ||
                meta === null ||
                !('assetsPath' in meta) ||
                typeof meta.assetsPath !== 'string'
              ) {
                throw new Error('Expected metadata.assetsPath to be a string');
              }
              return path.replace('pictures/', meta.assetsPath);
            },
          },
        },
      ],
    },
  });
});
