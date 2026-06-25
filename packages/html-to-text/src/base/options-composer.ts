/*
 * Source licence: MIT.
 * Portions Copyright (c) 2012-2019 werk85 <malte@werk85.de>
 * Portions Copyright (c) 2020-2026 KillyMXI <killy@mxii.eu.org>
 */

import { deepmergeCustom } from 'deepmerge-ts';
import type {
  FormatCallback,
  HtmlToTextOptions,
  SelectorDefinition,
} from '../types.js';

type MergeKey = string | number | symbol;

interface OptionsComposeMergeMeta {
  keyPath: MergeKey[];
}

interface ComposeOptionsParams {
  defaultOptions: HtmlToTextOptions;
  userOptions?: HtmlToTextOptions;
  genericFormatters: Record<string, FormatCallback>;
  packageFormatters: Record<string, FormatCallback>;
  handleMergedOptions?: (options: HtmlToTextOptions) => void;
}

const mergeArraysOverwrite = <T>(values: ReadonlyArray<readonly T[]>): T[] => {
  const lastValue = values[values.length - 1];
  return Array.isArray(lastValue) ? [...lastValue] : [];
};

const deepMergeWithOverwriteArrays = deepmergeCustom({
  filterValues: false,
  mergeArrays: mergeArraysOverwrite,
});

const deepMergeWithOptionsComposeRules = deepmergeCustom<
  unknown,
  object,
  OptionsComposeMergeMeta
>({
  filterValues: false,
  mergeArrays: (values, _utils, meta) => {
    const keyPath = meta?.keyPath ? meta.keyPath : [];
    const isRootSelectors = keyPath.length === 1 && keyPath[0] === 'selectors';
    return isRootSelectors ? values.flat() : mergeArraysOverwrite(values);
  },
  metaDataUpdater: (previousMeta, metaMeta) => {
    if (previousMeta === undefined) {
      return metaMeta.key === undefined
        ? { keyPath: [] }
        : { keyPath: [metaMeta.key] };
    }
    if (metaMeta.key === undefined) {
      return previousMeta;
    }
    return { keyPath: [...previousMeta.keyPath, metaMeta.key] };
  },
});

/**
 * Deduplicate an array by a given key callback.
 * Item properties are merged recursively and with the preference for last defined values.
 * Of items with the same key, merged item takes the place of the last item,
 * others are omitted.
 *
 * @param { any[] } items An array to deduplicate.
 * @param { (x: any) => string } getKey Callback to get a value that distinguishes unique items.
 * @returns { any[] }
 */
function mergeDuplicatesPreferLast<T>(
  items: readonly T[],
  getKey: (x: T) => string,
): T[] {
  const map = new Map<string, T>();
  for (let i = items.length; i-- > 0; ) {
    const item = items[i] as T;
    const key = getKey(item);
    const previous = map.get(key);
    map.set(
      key,
      previous === undefined
        ? item
        : (deepMergeWithOverwriteArrays(item, previous) as T),
    );
  }
  return [...map.values()].reverse();
}

/**
 * Merge default and user options, merge formatters and deduplicate selectors.
 *
 * @param { object } params Options preprocessing parameters.
 * @param { Options } params.defaultOptions Package default options.
 * @param { Options } [params.userOptions] User-provided options.
 * @param { object } params.genericFormatters Generic formatters.
 * @param { object } params.packageFormatters Package-specific formatters.
 * @param { (options: Options) => void } [params.handleMergedOptions]
 * Hook to mutate merged options after formatter/selector preprocessing.
 * @returns { Options }
 */
function composeOptions({
  defaultOptions,
  userOptions = {},
  genericFormatters,
  packageFormatters,
  handleMergedOptions,
}: ComposeOptionsParams): HtmlToTextOptions {
  const options = deepMergeWithOptionsComposeRules(
    defaultOptions,
    userOptions,
  ) as HtmlToTextOptions;
  options.formatters = Object.assign(
    {},
    genericFormatters,
    packageFormatters,
    options.formatters,
  );
  options.selectors = mergeDuplicatesPreferLast(
    options.selectors ?? [],
    (s: SelectorDefinition) => s.selector,
  );

  if (handleMergedOptions) {
    handleMergedOptions(options);
  }

  return options;
}

/**
 * Merge partial option objects coming from CLI args, presets and/or JSON files,
 * deduplicate selectors, ignore (remove) formatters.
 *
 * @param { object } acc Accumulated options.
 * @param { object } next Next partial options to merge.
 * @returns { object }
 */
function composeCliOptions(
  acc: HtmlToTextOptions = {},
  next: HtmlToTextOptions = {},
): HtmlToTextOptions {
  const merged = deepMergeWithOptionsComposeRules(
    acc,
    next,
  ) as HtmlToTextOptions;

  if (Array.isArray(merged.selectors)) {
    merged.selectors = mergeDuplicatesPreferLast(
      merged.selectors,
      (s: SelectorDefinition) => s.selector,
    );
  }

  if ('formatters' in merged) {
    delete merged.formatters;
  }

  return merged;
}

export { composeCliOptions, composeOptions, mergeDuplicatesPreferLast };
