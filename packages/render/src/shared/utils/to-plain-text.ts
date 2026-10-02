import {
  type CompiledFunction,
  compile,
  type HtmlToTextOptions,
  type SelectorDefinition,
} from '@solid-email/html-to-text';

// Text-export note: images and
// preview-only nodes are skipped, and links render without duplicated hrefs.
export const plainTextSelectors: SelectorDefinition[] = [
  { selector: 'img', format: 'skip' },
  { selector: '[data-skip-in-text]', format: 'skip' },
  {
    selector: 'a',
    options: { linkBrackets: false, hideLinkHrefIfSameAsText: true },
  },
];
let defaultConverter: CompiledFunction | undefined;
let defaultSelectorSnapshot: SelectorDefinition[] | undefined;

const OPTION_SNAPSHOT_KEYS = [
  'baseElements',
  'decodeEntities',
  'encodeCharacters',
  'formatters',
  'limits',
  'longWordSplit',
  'preserveNewlines',
  'selectors',
  'whitespaceCharacters',
  'wordwrap',
] as const satisfies readonly (keyof HtmlToTextOptions)[];

type OptionSnapshotKey = (typeof OPTION_SNAPSHOT_KEYS)[number];

type OptionsSnapshot = Readonly<Pick<HtmlToTextOptions, OptionSnapshotKey>> & {
  readonly customSelectorSnapshot: SelectorDefinition[] | undefined;
  readonly plainSelectorSnapshot: SelectorDefinition[];
};

type CachedConverter = {
  readonly converter: CompiledFunction;
  readonly snapshot: OptionsSnapshot;
};

const customConverterCache = new WeakMap<HtmlToTextOptions, CachedConverter>();

function plainSelectorsChanged(snapshot: SelectorDefinition[]) {
  return (
    snapshot.length !== plainTextSelectors.length ||
    snapshot.some((selector, index) => selector !== plainTextSelectors[index])
  );
}

function getDefaultConverter() {
  const changed =
    !defaultSelectorSnapshot || plainSelectorsChanged(defaultSelectorSnapshot);

  if (!defaultConverter || changed) {
    defaultSelectorSnapshot = [...plainTextSelectors];
    defaultConverter = compile({
      wordwrap: false,
      selectors: defaultSelectorSnapshot,
    });
  }

  return defaultConverter;
}

function createOptionsSnapshot(
  options: HtmlToTextOptions,
  plainSelectorSnapshot: SelectorDefinition[],
  customSelectorSnapshot: SelectorDefinition[] | undefined,
): OptionsSnapshot {
  return {
    baseElements: options.baseElements,
    decodeEntities: options.decodeEntities,
    encodeCharacters: options.encodeCharacters,
    formatters: options.formatters,
    limits: options.limits,
    longWordSplit: options.longWordSplit,
    preserveNewlines: options.preserveNewlines,
    customSelectorSnapshot,
    plainSelectorSnapshot,
    selectors: options.selectors,
    whitespaceCharacters: options.whitespaceCharacters,
    wordwrap: options.wordwrap,
  };
}

function customOptionsChanged(
  options: HtmlToTextOptions,
  snapshot: OptionsSnapshot,
) {
  return (
    plainSelectorsChanged(snapshot.plainSelectorSnapshot) ||
    OPTION_SNAPSHOT_KEYS.some((key) => options[key] !== snapshot[key]) ||
    options.selectors?.length !== snapshot.customSelectorSnapshot?.length ||
    (options.selectors?.some(
      (selector, index) =>
        selector !== snapshot.customSelectorSnapshot?.[index],
    ) ??
      false)
  );
}

function getCustomConverter(options: HtmlToTextOptions) {
  const cached = customConverterCache.get(options);
  if (cached && !customOptionsChanged(options, cached.snapshot)) {
    return cached.converter;
  }

  const plainSelectorSnapshot = [...plainTextSelectors];
  const customSelectorSnapshot = options.selectors
    ? [...options.selectors]
    : undefined;
  const selectors = [
    ...plainSelectorSnapshot,
    ...(customSelectorSnapshot ?? []),
  ];
  const converter = compile({
    wordwrap: false,
    ...options,
    selectors,
  });
  customConverterCache.set(options, {
    converter,
    snapshot: createOptionsSnapshot(
      options,
      plainSelectorSnapshot,
      customSelectorSnapshot,
    ),
  });

  return converter;
}

export function toPlainText(html: string, options?: HtmlToTextOptions) {
  if (!options) {
    return getDefaultConverter()(html);
  }

  return getCustomConverter(options)(html);
}
