import {
  normalizeCssProperty,
  type SolidStyle,
  styleObject,
} from '../../shared';

function escapeQuotes(value: unknown) {
  if (typeof value === 'string' && value.includes('"')) {
    return value.replace(/"/g, '&quot;');
  }
  return value;
}

const numericalCssProperties: Record<string, true> = {
  width: true,
  height: true,
  margin: true,
  'margin-top': true,
  'margin-right': true,
  'margin-bottom': true,
  'margin-left': true,
  padding: true,
  'padding-top': true,
  'padding-right': true,
  'padding-bottom': true,
  'padding-left': true,
  'border-width': true,
  'border-top-width': true,
  'border-right-width': true,
  'border-bottom-width': true,
  'border-left-width': true,
  'outline-width': true,
  top: true,
  right: true,
  bottom: true,
  left: true,
  'font-size': true,
  'letter-spacing': true,
  'word-spacing': true,
  'max-width': true,
  'min-width': true,
  'max-height': true,
  'min-height': true,
  'border-radius': true,
  'border-top-left-radius': true,
  'border-top-right-radius': true,
  'border-bottom-left-radius': true,
  'border-bottom-right-radius': true,
  'text-indent': true,
  'grid-column-gap': true,
  'grid-row-gap': true,
  'grid-gap': true,
  'translate-x': true,
  'translate-y': true,
};

export function parseCssInJsToInlineCss(
  cssProperties: SolidStyle | undefined,
): string {
  if (!cssProperties) return '';

  return Object.entries(styleObject(cssProperties))
    .filter(([, value]) => value != null)
    .map(([property, value]) => {
      const normalizedProperty = normalizeCssProperty(property);
      if (
        typeof value === 'number' &&
        numericalCssProperties[normalizedProperty]
      ) {
        return `${normalizedProperty}:${value}px`;
      }

      return `${normalizedProperty}:${escapeQuotes(value)}`;
    })
    .join(';');
}
