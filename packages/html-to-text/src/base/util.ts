/*
 * Source licence: MIT.
 * Portions Copyright (c) 2012-2019 werk85 <malte@werk85.de>
 * Portions Copyright (c) 2020-2026 KillyMXI <killy@mxii.eu.org>
 */

/**
 * Make a recursive function that will only run to a given depth
 * and switches to an alternative function at that depth. \
 * No limitation if `n` is `undefined` (Just wraps `f` in that case).
 *
 * @param   { number | undefined } n   Allowed depth of recursion. `undefined` for no limitation.
 * @param   { Function }           f   Function that accepts recursive callback as the first argument.
 * @param   { Function }           [g] Function to run instead, when maximum depth was reached. Do nothing by default.
 * @returns { Function }
 */
function limitedDepthRecursive<Args extends unknown[]>(
  n: number | undefined,
  f: (walk: (...args: Args) => void, ...args: Args) => void,
  g: (...args: Args) => void = () => undefined,
): (...args: Args) => void {
  if (n === undefined) {
    const f1: (...args: Args) => void = (...args) => f(f1, ...args);
    return f1;
  }
  if (n >= 0) {
    return (...args) => f(limitedDepthRecursive(n - 1, f, g), ...args);
  }
  return g;
}

/**
 * Return the same string or a substring with
 * the given character occurrences removed from each side.
 *
 * @param   { string } str  A string to trim.
 * @param   { string } char A character to be trimmed.
 * @returns { string }
 */
function trimCharacter(str: string, char: string): string {
  const code = char.charCodeAt(0);
  let start = 0;
  let end = str.length;
  while (start < end && str.charCodeAt(start) === code) {
    ++start;
  }
  while (end > start && str.charCodeAt(end - 1) === code) {
    --end;
  }
  return start > 0 || end < str.length ? str.substring(start, end) : str;
}

/**
 * Return the same string or a substring with
 * the given character occurrences removed from the end only.
 *
 * @param   { string } str  A string to trim.
 * @param   { string } char A character to be trimmed.
 * @returns { string }
 */
function trimCharacterEnd(str: string, char: string): string {
  const code = char.charCodeAt(0);
  let end = str.length;
  while (end > 0 && str.charCodeAt(end - 1) === code) {
    --end;
  }
  return end < str.length ? str.substring(0, end) : str;
}

/**
 * Return a new string will all characters replaced with unicode escape sequences.
 * This extreme kind of escaping can used to be safely compose regular expressions.
 *
 * @param { string } str A string to escape.
 * @returns { string } A string of unicode escape sequences.
 */
function unicodeEscape(str: string): string {
  return str.replace(
    /[\s\S]/g,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

/**
 * Get a nested property from an object.
 *
 * @param   { object }   obj  The object to query for the value.
 * @param   { string[] } path The path to the property.
 * @returns { any }
 */
function get(obj: unknown, path: string[]): unknown {
  let value = obj;
  for (const key of path) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

/**
 * Convert a number into alphabetic sequence representation (Sequence without zeroes).
 *
 * For example: `a, ..., z, aa, ..., zz, aaa, ...`.
 *
 * @param   { number } num         Number to convert. Must be >= 1.
 * @param   { string } [baseChar]  Character for 1 in the sequence.
 * @param   { number } [base]      Number of characters in the sequence.
 * @returns { string }
 */
function numberToLetterSequence(
  num: number,
  baseChar = 'a',
  base = 26,
): string {
  const digits: number[] = [];
  do {
    num -= 1;
    digits.push(num % base);
    num = (num / base) >> 0; // quick `floor`
  } while (num > 0);
  const baseCode = baseChar.charCodeAt(0);
  return digits
    .reverse()
    .map((n) => String.fromCharCode(baseCode + n))
    .join('');
}

const I: Record<number, string> = { 0: 'I', 1: 'X', 2: 'C', 3: 'M' };
const V: Record<number, string> = { 0: 'V', 1: 'L', 2: 'D' };

/**
 * Convert a number to it's Roman representation. No large numbers extension.
 *
 * @param   { number } num Number to convert. `0 < num <= 3999`.
 * @returns { string }
 */
function numberToRoman(num: number): string {
  return [...`${num}`]
    .map((n) => +n)
    .reverse()
    .map((v, i) => {
      const one = I[i] ?? '';
      const five = V[i] ?? '';
      const nextOne = I[i + 1] ?? '';
      return v % 5 < 4
        ? (v < 5 ? '' : five) + one.repeat(v % 5)
        : one + (v < 5 ? five : nextOne);
    })
    .reverse()
    .join('');
}

export {
  get,
  limitedDepthRecursive,
  numberToLetterSequence,
  numberToRoman,
  trimCharacter,
  trimCharacterEnd,
  unicodeEscape,
};
