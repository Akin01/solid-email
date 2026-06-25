import * as genericFormatters from './base/generic-formatters.js';
import { compile as compile_ } from './base/index.js';
import { composeOptions } from './base/options-composer.js';

import * as textFormatters from './text-formatters.js';

import type {
  CompiledFunction,
  CompiledHtmlToTextOptions,
  HtmlToTextOptions,
  MetaData,
} from './types.js';

export type * from './types.js';

/**
 * Default options.
 *
 * @constant
 * @type { Options }
 * @default
 * @private
 */
const DEFAULT_OPTIONS = {
  baseElements: {
    selectors: ['body'],
    orderBy: 'selectors', // 'selectors' | 'occurrence'
    returnDomByDefault: true,
  },
  decodeEntities: true,
  encodeCharacters: {},
  formatters: {},
  limits: {
    ellipsis: '...',
    maxBaseElements: undefined,
    maxChildNodes: undefined,
    maxDepth: undefined,
    maxInputLength: 1 << 24, // 16_777_216
  },
  longWordSplit: {
    forceWrapOnLimit: false,
    wrapCharacters: [],
  },
  preserveNewlines: false,
  selectors: [
    { selector: '*', format: 'inline' },
    {
      selector: 'a',
      format: 'anchor',
      options: {
        baseUrl: null,
        hideLinkHrefIfSameAsText: false,
        ignoreHref: false,
        linkBrackets: ['[', ']'],
        noAnchorUrl: true,
      },
    },
    {
      selector: 'article',
      format: 'block',
      options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
    },
    {
      selector: 'aside',
      format: 'block',
      options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
    },
    {
      selector: 'blockquote',
      format: 'blockquote',
      options: {
        leadingLineBreaks: 2,
        trailingLineBreaks: 2,
        trimEmptyLines: true,
      },
    },
    { selector: 'br', format: 'lineBreak' },
    {
      selector: 'div',
      format: 'block',
      options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
    },
    {
      selector: 'footer',
      format: 'block',
      options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
    },
    {
      selector: 'form',
      format: 'block',
      options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
    },
    {
      selector: 'h1',
      format: 'heading',
      options: { leadingLineBreaks: 3, trailingLineBreaks: 2, uppercase: true },
    },
    {
      selector: 'h2',
      format: 'heading',
      options: { leadingLineBreaks: 3, trailingLineBreaks: 2, uppercase: true },
    },
    {
      selector: 'h3',
      format: 'heading',
      options: { leadingLineBreaks: 3, trailingLineBreaks: 2, uppercase: true },
    },
    {
      selector: 'h4',
      format: 'heading',
      options: { leadingLineBreaks: 2, trailingLineBreaks: 2, uppercase: true },
    },
    {
      selector: 'h5',
      format: 'heading',
      options: { leadingLineBreaks: 2, trailingLineBreaks: 2, uppercase: true },
    },
    {
      selector: 'h6',
      format: 'heading',
      options: { leadingLineBreaks: 2, trailingLineBreaks: 2, uppercase: true },
    },
    {
      selector: 'header',
      format: 'block',
      options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
    },
    {
      selector: 'hr',
      format: 'horizontalLine',
      options: {
        leadingLineBreaks: 2,
        length: undefined,
        trailingLineBreaks: 2,
      },
    },
    {
      selector: 'img',
      format: 'image',
      options: { baseUrl: null, linkBrackets: ['[', ']'] },
    },
    {
      selector: 'main',
      format: 'block',
      options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
    },
    {
      selector: 'nav',
      format: 'block',
      options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
    },
    {
      selector: 'ol',
      format: 'orderedList',
      options: { leadingLineBreaks: 2, trailingLineBreaks: 2 },
    },
    {
      selector: 'p',
      format: 'paragraph',
      options: { leadingLineBreaks: 2, trailingLineBreaks: 2 },
    },
    {
      selector: 'pre',
      format: 'pre',
      options: { leadingLineBreaks: 2, trailingLineBreaks: 2 },
    },
    {
      selector: 'section',
      format: 'block',
      options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
    },
    {
      selector: 'table',
      format: 'table',
      options: {
        colSpacing: 3,
        leadingLineBreaks: 2,
        maxColumnWidth: 60,
        rowSpacing: 0,
        trailingLineBreaks: 2,
        uppercaseHeaderCells: true,
      },
    },
    {
      selector: 'ul',
      format: 'unorderedList',
      options: {
        itemPrefix: ' * ',
        leadingLineBreaks: 2,
        trailingLineBreaks: 2,
      },
    },
    { selector: 'wbr', format: 'wbr' },
  ],
  whitespaceCharacters: ' \t\r\n\f\u200b',
  wordwrap: 80,
} satisfies CompiledHtmlToTextOptions;

/**
 * Preprocess options, compile selectors into a decision tree,
 * return a function intended for batch processing.
 *
 * @param   { Options } [options]   HtmlToText options.
 * @returns { (html: string, metadata?: any) => string } Pre-configured converter function.
 * @static
 */
function compile(options: HtmlToTextOptions = {}): CompiledFunction {
  const mergedOptions = composeOptions({
    defaultOptions: DEFAULT_OPTIONS,
    genericFormatters: genericFormatters,
    packageFormatters: textFormatters,
    userOptions: options,
  }) as CompiledHtmlToTextOptions;

  return compile_(mergedOptions) as CompiledFunction;
}

/**
 * Convert given HTML content to plain text string.
 *
 * @param   { string }  html           HTML content to convert.
 * @param   { Options } [options]      HtmlToText options.
 * @param   { any }     [metadata]     Optional metadata for HTML document, for use in formatters.
 * @returns { string }                 Plain text string.
 * @static
 *
 * @example
 * const { convert } = require('html-to-text');
 * const text = convert('<h1>Hello World</h1>', {
 *   wordwrap: 130
 * });
 * console.log(text); // HELLO WORLD
 */
function convert(
  html: string,
  options: HtmlToTextOptions = {},
  metadata: MetaData = undefined,
): string {
  return compile(options)(html, metadata);
}

export { compile, convert, convert as htmlToText };
