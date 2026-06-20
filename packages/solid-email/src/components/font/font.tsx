type FallbackFont =
  | 'Arial'
  | 'Helvetica'
  | 'Verdana'
  | 'Georgia'
  | 'Times New Roman'
  | 'serif'
  | 'sans-serif'
  | 'monospace'
  | 'cursive'
  | 'fantasy';

type FontFormat =
  | 'woff'
  | 'woff2'
  | 'truetype'
  | 'opentype'
  | 'embedded-opentype'
  | 'svg';

export interface FontProps {
  /** Do not insert multiple fonts here; use fallbackFontFamily for that. */
  fontFamily: string;
  /** Arrays are allowed and ordered by priority. */
  fallbackFontFamily: FallbackFont | FallbackFont[];
  /** Not all clients support web fonts. See https://www.caniemail.com/features/css-at-font-face/. */
  webFont?: { url: string; format: FontFormat };
  /** @default 'normal' */
  fontStyle?: string;
  /** @default 400 */
  fontWeight?: string | number;
}

/** Place this component inside the `<head>` tag. */
export function Font(props: Readonly<FontProps>) {
  const fallback = Array.isArray(props.fallbackFontFamily)
    ? props.fallbackFontFamily.join(', ')
    : props.fallbackFontFamily;
  const msoFallback = Array.isArray(props.fallbackFontFamily)
    ? props.fallbackFontFamily[0]
    : props.fallbackFontFamily;
  const src = props.webFont
    ? `src: url(${props.webFont.url}) format('${props.webFont.format}');`
    : '';
  // Rendering note: Solid's `innerHTML` preserves the generated raw CSS
  // without introducing escaped text nodes.
  const css = `@font-face { font-family: '${props.fontFamily}'; font-style: ${props.fontStyle ?? 'normal'}; font-weight: ${props.fontWeight ?? 400}; mso-font-alt: '${msoFallback}'; ${src} } * { font-family: '${props.fontFamily}', ${fallback}; }`;
  return <style innerHTML={css} />;
}
