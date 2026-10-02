import type { JSX } from '@solidjs/web';
import { ssr } from '@solidjs/web';
import {
  type CssNode,
  generate,
  List,
  type StyleSheet,
} from 'css-tree/dist/csstree.esm';
import { createMemo, Loading } from 'solid-js';
import type { Config } from 'tailwindcss';
import type { SolidStyle } from '../shared';
import { sanitizeStyleSheet } from './sanitize-stylesheet';
import { sanitizeClassName } from './utils/compatibility/sanitize-class-name';
import { downlevelForEmailClients } from './utils/css/downlevel-for-email-clients';
import {
  extractRulesPerClass,
  type RulesPerClass,
} from './utils/css/extract-rules-per-class';
import {
  type CustomProperties,
  getCustomProperties,
} from './utils/css/get-custom-properties';
import { makeInlineStylesFor } from './utils/css/make-inline-styles-for';
import { sanitizeNonInlinableRules } from './utils/css/sanitize-non-inlinable-rules';
import {
  setupTailwind,
  type TailwindSetup,
} from './utils/tailwindcss/setup-tailwind';

export type TailwindConfig = Omit<Config, 'content'>;

export interface EmailElementProps {
  children?: JSX.Element;
  class?: string;
  className?: string;
  style?: SolidStyle;
}

export interface TailwindProps {
  children: JSX.Element;
  config?: TailwindConfig;
  theme?: string;
  utility?: string;
}

export const pixelBasedPreset: TailwindConfig = {
  theme: {
    extend: {
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '36px' }],
        '5xl': ['48px', { lineHeight: '1' }],
        '6xl': ['60px', { lineHeight: '1' }],
        '7xl': ['72px', { lineHeight: '1' }],
        '8xl': ['96px', { lineHeight: '1' }],
        '9xl': ['144px', { lineHeight: '1' }],
      },
      spacing: {
        px: '1px',
        0: '0',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
        36: '144px',
        40: '160px',
        44: '176px',
        48: '192px',
        52: '208px',
        56: '224px',
        60: '240px',
        64: '256px',
        72: '288px',
        80: '320px',
        96: '384px',
      },
    },
  },
};

interface SolidSsrString {
  t: string;
}

function isSolidSsrString(value: unknown): value is SolidSsrString {
  return (
    value !== null &&
    typeof value === 'object' &&
    't' in value &&
    typeof value.t === 'string'
  );
}

function toHtml(value: JSX.Element): string {
  if (value == null || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return `${value}`;
  if (Array.isArray(value)) return value.map((item) => toHtml(item)).join('');
  if (isSolidSsrString(value)) return value.t;
  return '';
}

function stringifyConfig(value: unknown): string {
  return JSON.stringify(value, (_key, nestedValue: unknown) => {
    if (typeof nestedValue === 'function') return nestedValue.toString();
    return nestedValue;
  });
}

const CLASS_ATTR_CAPTURE = /\sclass="([^"]*)"/;
const STYLE_ATTR_CAPTURE = /\sstyle="([^"]*)"/;
const CLASS_ATTR_REMOVE = /\sclass="[^"]*"/;
const STYLE_ATTR_REMOVE = /\sstyle="[^"]*"/;

function getAttribute(tag: string, name: string): string | undefined {
  if (name === 'class') return CLASS_ATTR_CAPTURE.exec(tag)?.[1];
  if (name === 'style') return STYLE_ATTR_CAPTURE.exec(tag)?.[1];
  const match = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return match?.[1];
}

function removeAttribute(tag: string, name: string): string {
  if (name === 'class') return tag.replace(CLASS_ATTR_REMOVE, '');
  if (name === 'style') return tag.replace(STYLE_ATTR_REMOVE, '');
  return tag.replace(new RegExp(`\\s${name}="[^"]*"`), '');
}

function escapeAttribute(value: string): string {
  if (!value.includes('&') && !value.includes('"') && !value.includes('<')) {
    return value;
  }
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');
}

function setAttribute(tag: string, name: string, value: string): string {
  const replacement = ` ${name}="${escapeAttribute(value)}"`;
  if (name === 'class') {
    if (CLASS_ATTR_REMOVE.test(tag)) {
      return tag.replace(CLASS_ATTR_REMOVE, replacement);
    }
  } else if (name === 'style') {
    if (STYLE_ATTR_REMOVE.test(tag)) {
      return tag.replace(STYLE_ATTR_REMOVE, replacement);
    }
  } else {
    const attributePattern = new RegExp(`\\s${name}="[^"]*"`);
    if (attributePattern.test(tag)) {
      return tag.replace(attributePattern, replacement);
    }
  }

  const suffix = tag.endsWith('/>') ? '/>' : '>';
  return `${tag.slice(0, -suffix.length)}${replacement}${suffix}`;
}

function forEachClassName(
  value: string,
  callback: (className: string) => void,
): void {
  let start = -1;
  for (let index = 0; index <= value.length; index += 1) {
    const code = index < value.length ? value.charCodeAt(index) : 32;
    const isWhitespace =
      code === 32 || code === 9 || code === 10 || code === 12 || code === 13;
    if (isWhitespace) {
      if (start !== -1) {
        callback(value.slice(start, index));
        start = -1;
      }
    } else if (start === -1) {
      start = index;
    }
  }
}

function classList(value: string): string[] {
  const classes: string[] = [];
  forEachClassName(value, (className) => classes.push(className));
  return classes;
}

function collectClasses(html: string): string[] {
  const classes = new Set<string>();
  const classPattern = /\sclass="([^"]*)"/g;
  let match = classPattern.exec(html);
  while (match !== null) {
    forEachClassName(match[1] ?? '', (className) => classes.add(className));
    match = classPattern.exec(html);
  }
  return Array.from(classes);
}

function serializeStyles(styles: Record<string, string>): string {
  let serialized = '';
  for (const property in styles) {
    const declaration = `${property}:${styles[property]}`;
    serialized = serialized ? `${serialized};${declaration}` : declaration;
  }
  return serialized;
}

interface InlineClassResult {
  generatedStyles: string;
  residualClass: string | undefined;
}

interface TailwindRenderPlan {
  inlineResults: Map<string, InlineClassResult>;
  nonInlineCss: string;
  nonInlinableClassNames: string[];
  tagCache: Map<string, string>;
}

const tailwindRenderPlanCache = new Map<string, TailwindRenderPlan>();

function applyInlineClassResult(
  tag: string,
  inlineResult: InlineClassResult,
): string {
  const existingStyle = getAttribute(tag, 'style');
  const style = inlineResult.generatedStyles
    ? existingStyle
      ? `${inlineResult.generatedStyles};${existingStyle}`
      : inlineResult.generatedStyles
    : (existingStyle ?? '');
  let nextTag = tag;

  if (style.length > 0) nextTag = setAttribute(nextTag, 'style', style);
  if (inlineResult.residualClass) {
    nextTag = setAttribute(nextTag, 'class', inlineResult.residualClass);
  } else {
    nextTag = removeAttribute(nextTag, 'class');
  }

  return nextTag;
}

function renderFromTailwindPlan(
  html: string,
  plan: TailwindRenderPlan,
): string | undefined {
  let missingClassGroup = false;
  const tagCache = plan.tagCache;
  const result = html.replace(
    /<([A-Za-z][A-Za-z0-9:-]*)([^<>]*?)>/g,
    (tag: string) => {
      const cached = tagCache.get(tag);
      if (cached !== undefined) return cached;

      const classAttribute = getAttribute(tag, 'class');
      if (!classAttribute) {
        tagCache.set(tag, tag);
        return tag;
      }

      const inlineResult = plan.inlineResults.get(classAttribute);
      if (!inlineResult) {
        missingClassGroup = true;
        return tag;
      }

      const transformed = applyInlineClassResult(tag, inlineResult);
      tagCache.set(tag, transformed);
      return transformed;
    },
  );

  if (missingClassGroup) return undefined;
  if (!plan.nonInlineCss) return result;
  if (!/<head(?:\s|>)/i.test(result)) {
    throw new Error(
      `Tailwind: <head> not found inside <Tailwind>.
Move <Head /> inside <Tailwind>, or remove these classes that require a <head>: ${plan.nonInlinableClassNames.join(
        ' ',
      )}.`,
    );
  }

  return insertNonInlineStyles(result, plan.nonInlineCss);
}

function inlineClassStyles(
  html: string,
  inlinableRules: RulesPerClass['inlinable'],
  nonInlinableRules: RulesPerClass['nonInlinable'],
  customProperties: CustomProperties,
  inlineCache: Map<string, InlineClassResult>,
  tagCache?: Map<string, string>,
): string {
  return html.replace(/<([A-Za-z][A-Za-z0-9:-]*)([^<>]*?)>/g, (tag: string) => {
    if (tagCache) {
      const cached = tagCache.get(tag);
      if (cached !== undefined) return cached;
    }
    const classAttribute = getAttribute(tag, 'class');
    if (!classAttribute) {
      tagCache?.set(tag, tag);
      return tag;
    }

    let inlineResult = inlineCache.get(classAttribute);
    if (!inlineResult) {
      const residualClasses: string[] = [];
      const rules: CssNode[] = [];
      for (const className of classList(classAttribute)) {
        const rule = inlinableRules.get(className);
        if (rule) rules.push(rule);
        if (nonInlinableRules.has(className)) {
          residualClasses.push(sanitizeClassName(className));
        } else if (!rule) {
          residualClasses.push(className);
        }
      }

      inlineResult = {
        generatedStyles: serializeStyles(
          makeInlineStylesFor(rules, customProperties),
        ),
        residualClass:
          residualClasses.length > 0 ? residualClasses.join(' ') : undefined,
      };
      inlineCache.set(classAttribute, inlineResult);
    }
    const transformed = applyInlineClassResult(tag, inlineResult);
    tagCache?.set(tag, transformed);
    return transformed;
  });
}

function insertNonInlineStyles(html: string, css: string): string {
  const styleTag = `<style>${css}</style>`;
  return html.replace(/<head([^>]*)>/i, (headTag) => `${headTag}${styleTag}`);
}

function renderTailwindHtml(
  html: string,
  classesUsed: string[],
  tailwindSetup: TailwindSetup,
  renderPlanKey: string,
) {
  tailwindSetup.addUtilities(classesUsed);

  const styleSheet = tailwindSetup.getStyleSheet();
  sanitizeStyleSheet(styleSheet);

  const { inlinable: inlinableRules, nonInlinable: nonInlinableRules } =
    extractRulesPerClass(styleSheet, classesUsed);
  const customProperties = getCustomProperties(styleSheet);

  const nonInlineStyles: StyleSheet = {
    type: 'StyleSheet',
    children: new List<CssNode>().fromArray(
      Array.from(nonInlinableRules.values()),
    ),
  };
  sanitizeNonInlinableRules(nonInlineStyles);
  downlevelForEmailClients(nonInlineStyles);

  const inlineResults = new Map<string, InlineClassResult>();
  const tagCache = new Map<string, string>();
  let result = inlineClassStyles(
    html,
    inlinableRules,
    nonInlinableRules,
    customProperties,
    inlineResults,
    tagCache,
  );

  const nonInlineCss =
    nonInlinableRules.size > 0 ? generate(nonInlineStyles) : '';
  const nonInlinableClassNames = Array.from(nonInlinableRules.keys());
  tailwindRenderPlanCache.set(renderPlanKey, {
    inlineResults,
    nonInlineCss,
    nonInlinableClassNames,
    tagCache,
  });

  if (!nonInlineCss) return result;

  if (!/<head(?:\s|>)/i.test(result)) {
    throw new Error(
      `Tailwind: <head> not found inside <Tailwind>.
Move <Head /> inside <Tailwind>, or remove these classes that require a <head>: ${nonInlinableClassNames.join(
        ' ',
      )}.`,
    );
  }

  result = insertNonInlineStyles(result, nonInlineCss);
  return result;
}

export function Tailwind(props: TailwindProps) {
  const twConfigData = () => ({
    config: props.config,
    cssConfigs: {
      theme: props.theme,
      utility: props.utility,
    },
  });
  const html = createMemo(
    async () => {
      const configKey = stringifyConfig(twConfigData());
      const rawHtml = toHtml(props.children);
      const classesUsed = collectClasses(rawHtml);
      const renderPlanKey = `${configKey}\n${classesUsed.join('\0')}`;
      const cachedPlan = tailwindRenderPlanCache.get(renderPlanKey);
      if (cachedPlan) {
        const cachedHtml = renderFromTailwindPlan(rawHtml, cachedPlan);
        if (cachedHtml !== undefined) return cachedHtml;
      }

      const setup = await setupTailwind(twConfigData());
      return renderTailwindHtml(rawHtml, classesUsed, setup, renderPlanKey);
    },
    { deferStream: true },
  );
  const content = (): JSX.Element => {
    const value = html();
    if (!value) return null;
    // Solid's raw SSR helper is typed as an internal template object, but JSX
    // accepts it as server-rendered output.
    const rawHtml = ssr(value) as unknown as JSX.Element;
    return rawHtml;
  };
  return <Loading fallback={null}>{content()}</Loading>;
}
