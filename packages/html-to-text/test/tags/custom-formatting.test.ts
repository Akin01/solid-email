import { test } from 'vitest';
import { htmlToText } from '../../src/index';
import { expectSnapshot } from '../snapshot-helpers';

test('should allow to override formatting of existing tags', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<h1>TeSt</h1><h1>mOrE tEsT</h1>',
    options: {
      formatters: {
        heading: (elem, walk, builder, _formatOptions) => {
          builder.openBlock({ leadingLineBreaks: 2 });
          builder.pushWordTransform((str) => str.toLowerCase());
          walk(elem.children, builder);
          builder.popWordTransform();
          builder.closeBlock({
            trailingLineBreaks: 2,
            blockTransform: (str) => {
              const line = '='.repeat(str.length);
              return `${line}\n${str}\n${line}`;
            },
          });
        },
      },
    },
  });
});

test('should allow to skip tags with dummy formatting function', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<ruby>漢<rt>かん</rt>字<rt>じ</rt></ruby>',
    options: { selectors: [{ selector: 'rt', format: 'skip' }] },
  });
});

test('should allow to define basic support for inline tags', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<p>a <span>b </span>c<span>  d  </span>e</p>',
    options: { selectors: [{ selector: 'span', format: 'inline' }] },
  });
});

test('should allow to define basic support for block-level tags', () => {
  expectSnapshot({
    convert: htmlToText,
    input:
      '<widget><gadget>a</gadget><fidget>b</fidget></widget>c<budget>d</budget>e',
    options: {
      selectors: [
        { selector: 'budget', format: 'block' },
        { selector: 'fidget', format: 'block' },
        { selector: 'gadget', format: 'block' },
        { selector: 'widget', format: 'block' },
      ],
    },
  });
});

test('should allow to add support for different tags', () => {
  expectSnapshot({
    convert: htmlToText,
    input: '<div><foo>foo<br/>content</foo><bar src="bar.src" /></div>',
    options: {
      formatters: {
        formatFoo: (elem, walk, builder, _formatOptions) => {
          builder.openBlock({ leadingLineBreaks: 1 });
          walk(elem.children, builder);
          builder.closeBlock({
            trailingLineBreaks: 1,
            blockTransform: (str) => `[FOO]${str}[/FOO]`,
          });
        },
        formatBar: (elem, _walk, builder, _formatOptions) => {
          const src = elem.attribs?.src;
          if (src === undefined) {
            throw new Error('Expected bar element to have a src attribute');
          }
          builder.addInline(`[BAR src="${src}"]`, {
            noWordTransform: true,
          });
        },
      },
      selectors: [
        { selector: 'foo', format: 'formatFoo' },
        { selector: 'bar', format: 'formatBar' },
      ],
    },
  });
});

test('should allow to call existing formatters from other formatters', () => {
  expectSnapshot({
    convert: htmlToText,
    input:
      '<div>Useful</div><div>Advertisement</div><article>Handy <section><div>info</div><div>Advertisement</div></section></article><article>ads galore</article>',
    options: {
      formatters: {
        adFreeBlock: (elem, walk, builder, formatOptions) => {
          // domutils package has functions more suitable in similar situations. This is just a unit test.
          const regExp =
            formatOptions.filterRegExp instanceof RegExp
              ? formatOptions.filterRegExp
              : /advertisement/i;
          if (
            elem.children?.some(
              (ch) =>
                ch.type === 'text' &&
                typeof ch.data === 'string' &&
                regExp.test(ch.data),
            )
          ) {
            // do nothing
          } else {
            const blockFormatter = builder.options.formatters.block;
            if (blockFormatter) {
              blockFormatter(elem, walk, builder, formatOptions);
            }
          }
        },
      },
      selectors: [
        { selector: 'div', format: 'adFreeBlock' },
        {
          selector: 'article',
          format: 'adFreeBlock',
          options: { filterRegExp: /^ad/i, leadingLineBreaks: 4 },
        },
      ],
    },
  });
});
