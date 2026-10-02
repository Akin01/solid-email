/*
 * Source licence: MIT.
 * Portions Copyright (c) 2012-2019 werk85 <malte@werk85.de>
 * Portions Copyright (c) 2020-2026 KillyMXI <killy@mxii.eu.org>
 */

import type { BuilderOptions } from './stack-item.js';

function fastJoin(arr: string[]): string {
  const len = arr.length;
  if (len === 0) return '';
  if (len === 1) return arr[0] ?? '';
  if (len === 2) return `${arr[0]} ${arr[1]}`;
  return arr.join(' ');
}
/**
 * Helps to build text from words.
 */
class InlineTextBuilder {
  declare lines: string[][];
  declare nextLineWords: string[];
  declare maxLineLength: number;
  declare nextLineAvailableChars: number;
  declare wrapCharacters: string[];
  declare forceWrapOnLimit: boolean;
  declare stashedSpace: boolean;
  declare wordBreakOpportunity: boolean;

  /**
   * Creates an instance of InlineTextBuilder.
   *
   * If `maxLineLength` is not provided then it is either `options.wordwrap` or unlimited.
   */
  constructor(
    options: BuilderOptions,
    maxLineLength: number | undefined = undefined,
  ) {
    this.lines = [];
    this.nextLineWords = [];
    this.maxLineLength = maxLineLength || options.wordwrap || Number.MAX_VALUE;
    this.nextLineAvailableChars = this.maxLineLength;
    this.wrapCharacters = options.longWordSplit?.wrapCharacters || [];
    this.forceWrapOnLimit = options.longWordSplit?.forceWrapOnLimit ?? false;

    this.stashedSpace = false;
    this.wordBreakOpportunity = false;
  }

  /**
   * Add a new word.
   */
  pushWord(word: string, noWrap = false): void {
    if (this.nextLineAvailableChars <= 0 && !noWrap) {
      this.startNewLine();
    }
    const isLineStart = this.nextLineWords.length === 0;
    const cost = word.length + (isLineStart ? 0 : 1);
    if (cost <= this.nextLineAvailableChars || noWrap) {
      // Fits into available budget

      this.nextLineWords.push(word);
      this.nextLineAvailableChars -= cost;
    } else {
      // Does not fit - try to split the word

      // The word is moved to a new line - prefer to wrap between words.
      const parts = this.splitLongWord(word);
      const first = parts[0] ?? '';
      if (!isLineStart) {
        this.startNewLine();
      }
      this.nextLineWords.push(first);
      this.nextLineAvailableChars -= first.length;
      for (let i = 1; i < parts.length; i++) {
        this.startNewLine();
        const part = parts[i] ?? '';
        this.nextLineWords.push(part);
        this.nextLineAvailableChars -= part.length;
      }
    }
  }

  /**
   * Pop a word from the currently built line.
   * This doesn't affect completed lines.
   */
  popWord(): string | undefined {
    const lastWord = this.nextLineWords.pop();
    if (lastWord !== undefined) {
      const isLineStart = this.nextLineWords.length === 0;
      const cost = lastWord.length + (isLineStart ? 0 : 1);
      this.nextLineAvailableChars += cost;
    }
    return lastWord;
  }

  /**
   * Concat a word to the last word already in the builder.
   * Adds a new word in case there are no words yet in the last line.
   */
  concatWord(word: string, noWrap = false): void {
    if (
      this.wordBreakOpportunity &&
      word.length > this.nextLineAvailableChars
    ) {
      this.pushWord(word, noWrap);
      this.wordBreakOpportunity = false;
    } else {
      const lastWord = this.popWord();
      this.pushWord(lastWord ? lastWord + word : word, noWrap);
    }
  }

  /**
   * Add current line (and more empty lines if provided argument > 1) to the list of complete lines and start a new one.
   */
  startNewLine(n = 1): void {
    this.lines.push(this.nextLineWords);
    if (n > 1) {
      for (let i = 1; i < n; i++) {
        this.lines.push([]);
      }
    }
    this.nextLineWords = [];
    this.nextLineAvailableChars = this.maxLineLength;
  }

  /**
   * No words in this builder.
   */
  isEmpty(): boolean {
    return this.lines.length === 0 && this.nextLineWords.length === 0;
  }

  clear(): void {
    this.lines.length = 0;
    this.nextLineWords.length = 0;
    this.nextLineAvailableChars = this.maxLineLength;
  }

  /**
   * Join all lines of words inside the InlineTextBuilder into a complete string.
   */
  toString(): string {
    let text = '';
    for (let index = 0; index < this.lines.length; index++) {
      if (index > 0) {
        text += '\n';
      }
      const line = this.lines[index];
      if (line && line.length > 0) {
        text += fastJoin(line);
      }
    }
    if (this.lines.length > 0) {
      text += '\n';
    }
    text += fastJoin(this.nextLineWords);
    return text;
  }
  /**
   * Split a long word up to fit within the word wrap limit.
   * Use either a character to split looking back from the word wrap limit,
   * or truncate to the word wrap limit.
   */
  splitLongWord(word: string): string[] {
    const parts: string[] = [];
    let idx = 0;
    while (word.length > this.maxLineLength) {
      const firstLine = word.substring(0, this.maxLineLength);
      const remainingChars = word.substring(this.maxLineLength);

      const splitIndex = firstLine.lastIndexOf(
        this.wrapCharacters[idx] as string,
      );

      if (splitIndex > -1) {
        // Found a character to split on

        word = firstLine.substring(splitIndex + 1) + remainingChars;
        parts.push(firstLine.substring(0, splitIndex + 1));
      } else {
        // Not found a character to split on

        idx++;
        if (idx < this.wrapCharacters.length) {
          // There is next character to try

          word = firstLine + remainingChars;
        } else {
          // No more characters to try

          if (this.forceWrapOnLimit) {
            parts.push(firstLine);
            word = remainingChars;
            if (word.length > this.maxLineLength) {
              continue;
            }
          } else {
            word = firstLine + remainingChars;
          }
          break;
        }
      }
    }
    parts.push(word); // Add remaining part to array
    return parts;
  }
}

export { InlineTextBuilder };
