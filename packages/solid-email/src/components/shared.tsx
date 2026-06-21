import type { JSX } from 'solid-js';

// Solid's JSX types omit a few legacy table/email attributes that still need
// to serialize as native HTML attributes.
declare module 'solid-js' {
  namespace JSX {
    interface ExplicitAttributes {
      align?: string | undefined;
      border?: number | string | undefined;
      cellpadding?: number | string | undefined;
      cellspacing?: number | string | undefined;
      valign?: string | undefined;
      width?: number | string | undefined;
    }
  }
}

// Components accept Solid's native style shape, CSS strings, and loose style
// objects so callers can pass practical email styles without losing type safety.
export type StyleValue = string | number | null | undefined;
export type SolidStyle = Record<string, StyleValue>;
export type StyleInput = JSX.CSSProperties | SolidStyle | string | undefined;

// Keep Solid intrinsic props as the base API, then add className as a
// compatibility alias and widen style to cover serialized CSS strings.
export type IntrinsicProps<K extends keyof JSX.IntrinsicElements> = Omit<
  JSX.IntrinsicElements[K],
  'style'
> & {
  className?: string | undefined;
  style?: StyleInput;
};

// Prefer Solid's class prop; fall back to className when a caller provides it.
export function cls(props: Record<string, unknown>): string | undefined {
  const value = props.class ?? props.className;
  if (typeof value !== 'string') return undefined;
  const classValue = value.trim();
  return classValue.length > 0 ? classValue : undefined;
}

// Remove presentation-only props and children before spreading attributes onto
// native elements. Reading children while cloning Solid props can eagerly resolve
// nested JSX during SSR.
export function withoutClass<T extends Record<string, unknown>>(
  props: T,
): Omit<T, 'class' | 'className' | 'style' | 'children'> {
  const copy: Record<string, unknown> = {};
  for (const key in props) {
    if (
      key !== 'class' &&
      key !== 'className' &&
      key !== 'style' &&
      key !== 'children'
    ) {
      copy[key] = props[key];
    }
  }
  return copy as Omit<T, 'class' | 'className' | 'style' | 'children'>;
}

// CSS properties that accept unitless numeric values. Other non-zero numbers
// are serialized with px so server-rendered output matches browser CSS rules.
const unitlessCssProperties: Record<string, true> = {
  'animation-iteration-count': true,
  'aspect-ratio': true,
  'border-image-outset': true,
  'border-image-slice': true,
  'border-image-width': true,
  'box-flex': true,
  'box-flex-group': true,
  'box-ordinal-group': true,
  'column-count': true,
  columns: true,
  flex: true,
  'flex-grow': true,
  'flex-positive': true,
  'flex-shrink': true,
  'flex-negative': true,
  'flex-order': true,
  'grid-area': true,
  'grid-column': true,
  'grid-column-end': true,
  'grid-column-span': true,
  'grid-column-start': true,
  'grid-row': true,
  'grid-row-end': true,
  'grid-row-span': true,
  'grid-row-start': true,
  'line-clamp': true,
  'line-height': true,
  opacity: true,
  order: true,
  orphans: true,
  scale: true,
  'tab-size': true,
  widows: true,
  'z-index': true,
  zoom: true,
};

// Convert numeric CSS values to serialized HTML-safe values.
export function normalizeCssValue(
  property: string,
  value: string | number,
): string | number {
  if (
    typeof value === 'number' &&
    value !== 0 &&
    !property.startsWith('--') &&
    !unitlessCssProperties[property]
  ) {
    return `${value}px`;
  }
  return value;
}

// Convert camelCase style keys to CSS property names while preserving custom
// properties such as --brand-color.
export function normalizeCssProperty(property: string): string {
  if (property.startsWith('--')) return property;
  return property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

// Parse a CSS declaration string into the same normalized map used by object
// styles.
export function styleStringObject(style: string): SolidStyle {
  const normalized: SolidStyle = {};
  for (const declaration of style.split(';')) {
    const trimmed = declaration.trim();
    if (!trimmed) continue;
    const separator = trimmed.indexOf(':');
    if (separator === -1) continue;
    const property = normalizeCssProperty(trimmed.slice(0, separator).trim());
    if (!property) continue;
    normalized[property] = trimmed.slice(separator + 1).trim();
  }
  return normalized;
}

// Normalize object style keys without dropping nullish values; callers that
// serialize styles decide whether nullish entries should be omitted.
export function styleObject(style: StyleInput): SolidStyle {
  if (style == null || typeof style === 'string') return {};
  const styleRecord = style as SolidStyle;
  const normalized: SolidStyle = {};
  for (const key in styleRecord) {
    normalized[normalizeCssProperty(key)] = styleRecord[key];
  }
  return normalized;
}

// Produce a Solid-compatible style value for SSR output.
export function normalizeStyle(
  style: StyleInput | null,
): JSX.CSSProperties | string | undefined {
  if (style == null) return undefined;
  if (typeof style === 'string') return style;
  const styleRecord = styleObject(style);
  const normalized: Record<string, string | number> = {};
  for (const property in styleRecord) {
    const value = styleRecord[property];
    if (value != null) {
      normalized[property] = normalizeCssValue(property, value);
    }
  }
  if (Object.keys(normalized).length === 0) return undefined;
  return normalized as JSX.CSSProperties;
}

// Padding moves to the inner td for components that render table wrappers.
export const paddingKeys: Record<string, true> = {
  padding: true,
  'padding-top': true,
  'padding-right': true,
  'padding-bottom': true,
  'padding-left': true,
};

// Split padding between wrapper table and inner td for client compatibility.
export function splitPadding(style: StyleInput) {
  const tableStyle: SolidStyle = {};
  const tdStyle: SolidStyle = {};
  const styleMap =
    typeof style === 'string' ? styleStringObject(style) : styleObject(style);
  for (const key in styleMap) {
    if (paddingKeys[key]) tdStyle[key] = styleMap[key];
    else tableStyle[key] = styleMap[key];
  }
  return { tableStyle, tdStyle };
}
