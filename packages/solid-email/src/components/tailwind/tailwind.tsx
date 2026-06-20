import { type CssNode, generate, List, type StyleSheet } from 'css-tree';
import { createResource, type JSX, Suspense } from 'solid-js';
import { ssr } from 'solid-js/web';
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

function getAttribute(tag: string, name: string): string | undefined {
  const match = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return match?.[1];
}

function removeAttribute(tag: string, name: string): string {
  return tag.replace(new RegExp(`\\s${name}="[^"]*"`), '');
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');
}

function setAttribute(tag: string, name: string, value: string): string {
  const replacement = ` ${name}="${escapeAttribute(value)}"`;
  const attributePattern = new RegExp(`\\s${name}="[^"]*"`);
  if (attributePattern.test(tag))
    return tag.replace(attributePattern, replacement);

  const suffix = tag.endsWith('/>') ? '/>' : '>';
  return `${tag.slice(0, -suffix.length)}${replacement}${suffix}`;
}

function classList(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

function collectClasses(html: string): string[] {
  const classes = new Set<string>();
  for (const match of html.matchAll(/\sclass="([^"]*)"/g)) {
    for (const className of classList(match[1] ?? '')) {
      classes.add(className);
    }
  }
  return Array.from(classes);
}

function serializeStyles(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([property, value]) => `${property}:${value}`)
    .join(';');
}

function inlineClassStyles(
  html: string,
  inlinableRules: RulesPerClass['inlinable'],
  nonInlinableRules: RulesPerClass['nonInlinable'],
  customProperties: CustomProperties,
): string {
  return html.replace(/<([A-Za-z][A-Za-z0-9:-]*)([^<>]*?)>/g, (tag: string) => {
    const classAttribute = getAttribute(tag, 'class');
    if (!classAttribute) return tag;

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

    const generatedStyles = serializeStyles(
      makeInlineStylesFor(rules, customProperties),
    );
    const existingStyle = getAttribute(tag, 'style');
    const style = [generatedStyles, existingStyle].filter(Boolean).join(';');
    let nextTag = tag;

    if (style.length > 0) nextTag = setAttribute(nextTag, 'style', style);
    if (residualClasses.length > 0) {
      nextTag = setAttribute(nextTag, 'class', residualClasses.join(' '));
    } else {
      nextTag = removeAttribute(nextTag, 'class');
    }

    return nextTag;
  });
}

function insertNonInlineStyles(html: string, css: string): string {
  const styleTag = `<style>${css}</style>`;
  return html.replace(/<head([^>]*)>/i, (headTag) => `${headTag}${styleTag}`);
}

function renderTailwindHtml(
  children: JSX.Element,
  tailwindSetup: TailwindSetup,
) {
  const html = toHtml(children);
  const classesUsed = collectClasses(html);
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

  let result = inlineClassStyles(
    html,
    inlinableRules,
    nonInlinableRules,
    customProperties,
  );

  if (nonInlinableRules.size === 0) return result;

  if (!/<head(?:\s|>)/i.test(result)) {
    throw new Error(
      `Tailwind: <head> not found inside <Tailwind>.
Move <Head /> inside <Tailwind>, or remove these classes that require a <head>: ${Array.from(
        nonInlinableRules.keys(),
      ).join(' ')}.`,
    );
  }

  result = insertNonInlineStyles(result, generate(nonInlineStyles));
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
  const [html] = createResource(
    () => stringifyConfig(twConfigData()),
    async () => {
      const setup = await setupTailwind(twConfigData());
      return renderTailwindHtml(props.children, setup);
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
  return <Suspense fallback={null}>{content()}</Suspense>;
}
