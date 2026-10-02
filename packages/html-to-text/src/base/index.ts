/*
 * Source licence: MIT.
 * Portions Copyright (c) 2012-2019 werk85 <malte@werk85.de>
 * Portions Copyright (c) 2020-2026 KillyMXI <killy@mxii.eu.org>
 */

import { hp2Builder } from '@selderee/plugin-htmlparser2';
import { parseDocument } from 'htmlparser2';
import { DecisionTree } from 'selderee';

import type {
  CharacterEncoder,
  CompiledFunction,
  CompiledHtmlToTextOptions,
  DomNode,
  HtmlToTextOptions,
  MetaData,
  RecursiveCallback,
  SelectorDefinition,
} from '../types.js';
import { BlockTextBuilder } from './block-text-builder.js';
import { limitedDepthRecursive, unicodeEscape } from './util.js';
import { WhitespaceProcessor } from './whitespace-processor.js';

const EMPTY_OBJECT = Object.freeze({});
const pickerCache = new Map<string, SelectorPicker>();
const pickerWeakCache = new WeakMap<object, SelectorPicker>();

function getSelectorsCacheKey(selectors: SelectorDefinition[]): string {
  try {
    return JSON.stringify(selectors, (_key, val) =>
      typeof val === 'function' ? val.toString() : val,
    );
  } catch {
    return '';
  }
}

function getOrBuildPicker(selectors: SelectorDefinition[]): SelectorPicker {
  const cachedFromWeak = pickerWeakCache.get(selectors);
  if (cachedFromWeak !== undefined) {
    return cachedFromWeak;
  }
  const key = getSelectorsCacheKey(selectors);
  if (key) {
    const cachedFromMap = pickerCache.get(key);
    if (cachedFromMap !== undefined) {
      pickerWeakCache.set(selectors, cachedFromMap);
      return cachedFromMap;
    }
  }
  const picker = new DecisionTree(selectors.map((s) => [s.selector, s])).build(
    hp2Builder,
  );
  pickerWeakCache.set(selectors, picker);
  if (key) {
    if (pickerCache.size >= 128) {
      const first = pickerCache.keys().next().value;
      if (first !== undefined) {
        pickerCache.delete(first);
      }
    }
    pickerCache.set(key, picker);
  }
  return picker;
}
type SelectorPicker = ReturnType<typeof hp2Builder<SelectorDefinition>>;
type BaseSelectorPicker = ReturnType<typeof hp2Builder<number>>;
type SelectorPickerElement = Parameters<SelectorPicker['pick1']>[0];
type BlockTextBuilderPicker = ConstructorParameters<typeof BlockTextBuilder>[1];
type BaseElementFinder = (dom: DomNode[]) => DomNode[];
type Walk = (dom: DomNode[] | undefined, builder: BlockTextBuilder) => void;
type ParserOptions = Parameters<typeof parseDocument>[1];

/**
 * Compile selectors into a decision tree,
 * return a function intended for batch processing.
 *
 * @param   { Options } [options]   HtmlToText options (defaults, formatters, user options merged, deduplicated).
 * @returns { (html: string, metadata?: any) => string } Pre-configured converter function.
 * @static
 */
function compile(options: HtmlToTextOptions = {}): CompiledFunction {
  const resolvedOptions = options as CompiledHtmlToTextOptions;
  const selectorsWithoutFormat = resolvedOptions.selectors.filter(
    (s) => !s.format,
  );
  if (selectorsWithoutFormat.length) {
    throw new Error(
      'Following selectors have no specified format: ' +
        selectorsWithoutFormat.map((s) => `\`${s.selector}\``).join(', '),
    );
  }
  const picker = getOrBuildPicker(resolvedOptions.selectors);
  const whitespaceProcessor = new WhitespaceProcessor(resolvedOptions);

  if (typeof resolvedOptions.encodeCharacters !== 'function') {
    resolvedOptions.encodeCharacters = makeReplacerFromDict(
      resolvedOptions.encodeCharacters,
    );
  }
  const parserOptions = { decodeEntities: resolvedOptions.decodeEntities };

  const findBaseElements = usesDefaultBodyBaseSelector(resolvedOptions)
    ? (dom: DomNode[]) => findBodyBase(dom, resolvedOptions)
    : (
        (baseSelectorsPicker: BaseSelectorPicker) => (dom: DomNode[]) =>
          findBases(dom, resolvedOptions, baseSelectorsPicker)
      )(
        new DecisionTree(
          resolvedOptions.baseElements.selectors.map((s, i) => [s, i + 1]),
        ).build(hp2Builder),
      );

  const limitedWalk = limitedDepthRecursive(
    resolvedOptions.limits.maxDepth,
    recursiveWalk,
    (_dom, builder) => {
      builder.addInline(resolvedOptions.limits.ellipsis || '');
    },
  );

  return (html, metadata = undefined) =>
    process(
      html,
      metadata,
      resolvedOptions,
      parserOptions,
      picker,
      findBaseElements,
      limitedWalk,
      whitespaceProcessor,
    );
}

/**
 * Convert given HTML according to preprocessed options.
 *
 * @param { string } html HTML content to convert.
 * @param { any } metadata Optional metadata for HTML document, for use in formatters.
 * @param { Options } options HtmlToText options (preprocessed).
 * @param { import('selderee').Picker<DomNode, TagDefinition> } picker
 * Tag definition picker for DOM nodes processing.
 * @param { (dom: DomNode[]) => DomNode[] } findBaseElements
 * Function to extract elements from HTML DOM
 * that will only be present in the output text.
 * @param { RecursiveCallback } walk Recursive callback.
 * @returns { string }
 */
function process(
  html: string,
  metadata: MetaData,
  options: CompiledHtmlToTextOptions,
  parserOptions: ParserOptions,
  picker: SelectorPicker,
  findBaseElements: BaseElementFinder,
  walk: Walk,
  whitespaceProcessor: WhitespaceProcessor,
): string {
  const maxInputLength = options.limits.maxInputLength;
  if (maxInputLength && html && html.length > maxInputLength) {
    console.warn(
      `Input length ${html.length} is above allowed limit of ${maxInputLength}. Truncating without ellipsis.`,
    );
    html = html.substring(0, maxInputLength);
  }

  const document = parseDocument(html, parserOptions);
  const bases = findBaseElements(document.children as unknown as DomNode[]);
  const builder = new BlockTextBuilder(
    options,
    picker as unknown as BlockTextBuilderPicker,
    metadata,
    whitespaceProcessor,
  );
  walk(bases, builder);
  return builder.toString();
}

function findBases(
  dom: DomNode[],
  options: CompiledHtmlToTextOptions,
  baseSelectorsPicker: BaseSelectorPicker,
): DomNode[] {
  const results: { selectorIndex: number; element: DomNode }[] = [];

  function recursiveWalk(walk: (dom: DomNode[]) => void, dom: DomNode[]): void {
    dom = dom.slice(0, options.limits.maxChildNodes);
    for (const elem of dom) {
      if (elem.type !== 'tag') {
        continue;
      }
      const pickedSelectorIndex =
        baseSelectorsPicker.pick1(elem as unknown as SelectorPickerElement) ??
        0;
      if (pickedSelectorIndex > 0) {
        results.push({ selectorIndex: pickedSelectorIndex, element: elem });
      } else if (elem.children) {
        walk(elem.children);
      }
      if (
        options.limits.maxBaseElements !== undefined &&
        results.length >= options.limits.maxBaseElements
      ) {
        return;
      }
    }
  }

  const limitedWalk = limitedDepthRecursive(
    options.limits.maxDepth,
    recursiveWalk,
  );
  limitedWalk(dom);

  if (options.baseElements.orderBy !== 'occurrence') {
    // 'selectors'
    results.sort((a, b) => a.selectorIndex - b.selectorIndex);
  }
  return options.baseElements.returnDomByDefault && results.length === 0
    ? dom
    : results.map((x) => x.element);
}

function usesDefaultBodyBaseSelector(
  options: CompiledHtmlToTextOptions,
): boolean {
  const selectors = options.baseElements.selectors;
  return (
    selectors.length === 1 &&
    selectors[0] === 'body' &&
    options.baseElements.orderBy !== 'occurrence'
  );
}

function findFirstBody(nodes: DomNode[]): DomNode | undefined {
  for (let i = 0; i < nodes.length; i++) {
    const elem = nodes[i];
    if (elem && elem.type === 'tag' && elem.name === 'body') {
      return elem;
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    const elem = nodes[i];
    if (elem && elem.type === 'tag' && elem.children) {
      const found = findFirstBody(elem.children);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function findBodyBase(
  dom: DomNode[],
  options: CompiledHtmlToTextOptions,
): DomNode[] {
  let body: DomNode | undefined;
  if (
    options.limits.maxDepth === undefined &&
    options.limits.maxChildNodes === undefined
  ) {
    body = findFirstBody(dom);
    return body ? [body] : options.baseElements.returnDomByDefault ? dom : [];
  }

  function recursiveWalk(
    walk: (dom: DomNode[]) => void,
    nodes: DomNode[],
  ): void {
    nodes = nodes.slice(0, options.limits.maxChildNodes);
    for (const elem of nodes) {
      if (elem.type !== 'tag') {
        continue;
      }
      if (elem.name === 'body') {
        body = elem;
        return;
      }
      if (elem.children) {
        walk(elem.children);
      }
      if (body) {
        return;
      }
    }
  }

  const limitedWalk = limitedDepthRecursive(
    options.limits.maxDepth,
    recursiveWalk,
  );
  limitedWalk(dom);

  return body ? [body] : options.baseElements.returnDomByDefault ? dom : [];
}

/**
 * Function to walk through DOM nodes and accumulate their string representations.
 *
 * @param   { RecursiveCallback } walk    Recursive callback.
 * @param   { DomNode[] }         [dom]   Nodes array to process.
 * @param   { BlockTextBuilder }  builder Passed around to accumulate output text.
 * @private
 */
function recursiveWalk(
  walk: Walk,
  dom: DomNode[] | undefined,
  builder: BlockTextBuilder,
): void {
  if (!dom) {
    return;
  }

  const options = builder.options as CompiledHtmlToTextOptions;

  const maxChildNodes = options.limits.maxChildNodes;
  const tooManyChildNodes =
    maxChildNodes !== undefined && dom.length > maxChildNodes;
  if (tooManyChildNodes) {
    dom = dom.slice(0, maxChildNodes);
    dom.push({
      data: options.limits.ellipsis,
      type: 'text',
    });
  }

  for (const elem of dom) {
    switch (elem.type) {
      case 'text': {
        const text = elem.data as string;
        if (text && text.length > 0) {
          builder.addInline(text);
        }
        break;
      }
      case 'tag': {
        const tagDefinition = builder.picker.pick1(elem);
        const formatName = tagDefinition.format;
        const format = formatName ? options.formatters[formatName] : undefined;
        if (!format) {
          throw new Error(`Unknown format for selector: ${formatName ?? ''}`);
        }
        format(
          elem,
          walk as RecursiveCallback,
          builder,
          tagDefinition.options || EMPTY_OBJECT,
        );
        break;
      }
      default:
        /* do nothing */
        break;
    }
  }

  return;
}

/**
 * @param { {[key: string]: string | false} } dict
 * A dictionary where keys are characters to replace
 * and values are replacement strings.
 *
 * First code point from dict keys is used.
 * Compound emojis with ZWJ are not supported (not until Node 16).
 *
 * @returns { ((str: string) => string) | undefined }
 */
function makeReplacerFromDict(
  dict: Record<string, string | false> | undefined,
): CharacterEncoder | undefined {
  if (!dict || Object.keys(dict).length === 0) {
    return undefined;
  }
  const entries = Object.entries(dict).filter(
    (entry): entry is [string, string] => entry[1] !== false,
  );
  const regex = new RegExp(
    entries.map(([c]) => `(${unicodeEscape([...c][0] as string)})`).join('|'),
    'g',
  );
  const values = entries.map(([, v]) => v);
  const replacer = (_m: string, ...cgs: string[]) =>
    values[cgs.findIndex((cg) => cg)] as string;
  return (str) => str.replace(regex, replacer);
}

export { compile };
