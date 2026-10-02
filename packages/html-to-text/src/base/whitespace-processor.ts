/*
 * Source licence: MIT.
 * Portions Copyright (c) 2012-2019 werk85 <malte@werk85.de>
 * Portions Copyright (c) 2020-2026 KillyMXI <killy@mxii.eu.org>
 */

import type { HtmlToTextOptions } from '../types.js';
import type { InlineTextBuilder } from './inline-text-builder.js';

type WhitespaceProcessorOptions = HtmlToTextOptions & {
  whitespaceCharacters: string;
};

type TextTransform = (str: string) => string;
type ShrinkWrapAdd = (
  text: string,
  inlineTextBuilder: InlineTextBuilder,
  transform?: TextTransform,
  noWrap?: boolean,
) => void;

function charactersToCodes(str: string): string {
  return [...str]
    .map((c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
    .join('');
}

/**
 * Helps to handle HTML whitespaces.
 *
 * @class WhitespaceProcessor
 */
class WhitespaceProcessor {
  /**
   * Creates an instance of WhitespaceProcessor.
   *
   * @param { Options } options    HtmlToText options.
   * @memberof WhitespaceProcessor
   */
  whitespaceChars: string;
  whitespaceTable: Uint8Array;
  leadingWhitespaceRe: RegExp;
  trailingWhitespaceRe: RegExp;
  allWhitespaceOrEmptyRe: RegExp;
  newlineOrNonWhitespaceRe: RegExp;
  newlineOrNonNewlineStringRe: RegExp;
  shrinkWrapAdd: ShrinkWrapAdd;
  constructor(options: WhitespaceProcessorOptions) {
    this.whitespaceChars = options.preserveNewlines
      ? options.whitespaceCharacters.replace(/\n/g, '')
      : options.whitespaceCharacters;
    const table = new Uint8Array(65536);
    for (let i = 0; i < this.whitespaceChars.length; i++) {
      table[this.whitespaceChars.charCodeAt(i)] = 1;
    }
    this.whitespaceTable = table;
    const whitespaceCodes = charactersToCodes(this.whitespaceChars);
    this.leadingWhitespaceRe = new RegExp(`^[${whitespaceCodes}]`);
    this.trailingWhitespaceRe = new RegExp(`[${whitespaceCodes}]$`);
    this.allWhitespaceOrEmptyRe = new RegExp(`^[${whitespaceCodes}]*$`);
    this.newlineOrNonWhitespaceRe = new RegExp(
      `(\\n|[^\\n${whitespaceCodes}])`,
      'g',
    );
    this.newlineOrNonNewlineStringRe = /(\n|[^\n]+)/g;

    if (options.preserveNewlines) {
      const wordOrNewlineRe = new RegExp(`\\n|[^\\n${whitespaceCodes}]+`, 'gm');

      /**
       * Shrink whitespaces and wrap text, add to the builder.
       *
       * @param { string }                  text              Input text.
       * @param { InlineTextBuilder }       inlineTextBuilder A builder to receive processed text.
       * @param { (str: string) => string } [ transform ]     A transform to be applied to words.
       * @param { boolean }                 [noWrap] Don't wrap text even if the line is too long.
       */
      this.shrinkWrapAdd = function (
        text: string,
        inlineTextBuilder: InlineTextBuilder,
        transform: TextTransform = (str) => str,
        noWrap = false,
      ) {
        wordOrNewlineRe.lastIndex = 0;
        if (!text) {
          return;
        }
        const previouslyStashedSpace = inlineTextBuilder.stashedSpace;
        let anyMatch = false;
        let m = wordOrNewlineRe.exec(text);
        if (m) {
          anyMatch = true;
          if (m[0] === '\n') {
            inlineTextBuilder.startNewLine();
          } else if (
            previouslyStashedSpace ||
            this.testLeadingWhitespace(text)
          ) {
            inlineTextBuilder.pushWord(transform(m[0]), noWrap);
          } else {
            inlineTextBuilder.concatWord(transform(m[0]), noWrap);
          }
          while (true) {
            m = wordOrNewlineRe.exec(text);
            if (m === null) {
              break;
            }
            if (m[0] === '\n') {
              inlineTextBuilder.startNewLine();
            } else {
              inlineTextBuilder.pushWord(transform(m[0]), noWrap);
            }
          }
        }
        inlineTextBuilder.stashedSpace =
          (previouslyStashedSpace && !anyMatch) ||
          this.testTrailingWhitespace(text);
        // No need to stash a space in case last added item was a new line,
        // but that won't affect anything later anyway.
      };
    } else {
      const wordRe = new RegExp(`[^${whitespaceCodes}]+`, 'g');

      this.shrinkWrapAdd = function (
        text: string,
        inlineTextBuilder: InlineTextBuilder,
        transform: TextTransform | undefined = undefined,
        noWrap = false,
      ) {
        wordRe.lastIndex = 0;
        if (!text) {
          return;
        }
        const previouslyStashedSpace = inlineTextBuilder.stashedSpace;
        let anyMatch = false;
        let m = wordRe.exec(text);
        if (m) {
          anyMatch = true;
          const word = transform ? transform(m[0]) : m[0];
          if (previouslyStashedSpace || this.testLeadingWhitespace(text)) {
            inlineTextBuilder.pushWord(word, noWrap);
          } else {
            inlineTextBuilder.concatWord(word, noWrap);
          }
          while (true) {
            m = wordRe.exec(text);
            if (m === null) {
              break;
            }
            inlineTextBuilder.pushWord(
              transform ? transform(m[0]) : m[0],
              noWrap,
            );
          }
        }
        inlineTextBuilder.stashedSpace =
          (previouslyStashedSpace && !anyMatch) ||
          this.testTrailingWhitespace(text);
      };
    }
  }

  /**
   * Add text with only minimal processing.
   * Everything between newlines considered a single word.
   * No whitespace is trimmed.
   * Not affected by preserveNewlines option - `\n` always starts a new line.
   *
   * `noWrap` argument is `true` by default - this won't start a new line
   * even if there is not enough space left in the current line.
   *
   * @param { string }            text              Input text.
   * @param { InlineTextBuilder } inlineTextBuilder A builder to receive processed text.
   * @param { boolean }           [noWrap] Don't wrap text even if the line is too long.
   */
  addLiteral(
    text: string,
    inlineTextBuilder: InlineTextBuilder,
    noWrap = true,
  ): void {
    if (!text) {
      return;
    }
    const previouslyStashedSpace = inlineTextBuilder.stashedSpace;
    let anyMatch = false;
    this.newlineOrNonNewlineStringRe.lastIndex = 0;
    let m = this.newlineOrNonNewlineStringRe.exec(text);
    if (m) {
      anyMatch = true;
      if (m[0] === '\n') {
        inlineTextBuilder.startNewLine();
      } else if (previouslyStashedSpace) {
        inlineTextBuilder.pushWord(m[0], noWrap);
      } else {
        inlineTextBuilder.concatWord(m[0], noWrap);
      }
      while (true) {
        m = this.newlineOrNonNewlineStringRe.exec(text);
        if (m === null) {
          break;
        }
        if (m[0] === '\n') {
          inlineTextBuilder.startNewLine();
        } else {
          inlineTextBuilder.pushWord(m[0], noWrap);
        }
      }
    }
    inlineTextBuilder.stashedSpace = previouslyStashedSpace && !anyMatch;
  }

  /**
   * Test whether the given text starts with HTML whitespace character.
   *
   * @param   { string }  text  The string to test.
   * @returns { boolean }
   */
  testLeadingWhitespace(text: string): boolean {
    return text.length > 0 && this.whitespaceTable[text.charCodeAt(0)] === 1;
  }

  testTrailingWhitespace(text: string): boolean {
    return (
      text.length > 0 &&
      this.whitespaceTable[text.charCodeAt(text.length - 1)] === 1
    );
  }

  testContainsWords(text: string): boolean {
    const table = this.whitespaceTable;
    for (let i = 0; i < text.length; i++) {
      if (table[text.charCodeAt(i)] === 0) {
        return true;
      }
    }
    return false;
  }

  countNewlinesNoWords(text: string): number {
    const table = this.whitespaceTable;
    let counter = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code === 10) {
        counter++;
      } else if (table[code] === 0) {
        return 0;
      }
    }
    return counter;
  }
}

export { WhitespaceProcessor };
