import type { JSX } from '@solidjs/web';
import { renderToStream, renderToString } from '@solidjs/web';
import type { Options, RenderSyncOptions } from './options';
import { pretty } from './utils/pretty';
import { toPlainText } from './utils/to-plain-text';

export type Renderable = JSX.Element | (() => JSX.Element);

const doctype =
  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
export const solidRenderOptions = {
  renderId: 'solid-email',
  noScripts: true,
} as const;

export function normalizeRenderable(node: Renderable) {
  return typeof node === 'function' ? (node as () => JSX.Element) : () => node;
}

function decodeSerializedString(value: string): string {
  try {
    const jsonSafe = value.replace(
      /\\x([0-9A-Fa-f]{2})/g,
      (_match, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)),
    );
    const parsed: unknown = JSON.parse(`"${jsonSafe}"`);
    return typeof parsed === 'string' ? parsed : value;
  } catch {
    return value;
  }
}

export function removeSolidResourceScripts(html: string): string {
  const errorMatch = /Object\.assign\(new Error\("((?:\\.|[^"\\])*)"\)/.exec(
    html,
  );
  if (errorMatch) {
    throw new Error(decodeSerializedString(errorMatch[1] ?? ''));
  }
  return html
    .replace(/<script>self\.\$R=self\.\$R\|\|\[\];[\s\S]*?<\/script>/g, '')
    .replace(/<!--!\$-->/g, '');
}

export function renderDocument(html: string): string {
  return `${doctype}${html.replace(/<!DOCTYPE.*?>/, '').replace(/<!--!\$-->/g, '')}`;
}

export function renderSyncOutput(
  html: string,
  options?: RenderSyncOptions,
): string {
  if (options?.plainText) {
    return toPlainText(html, options.htmlToTextOptions);
  }

  return renderDocument(html);
}

export async function renderOutput(
  html: string,
  options?: Options,
): Promise<string> {
  if (options?.plainText) {
    return toPlainText(html, options.htmlToTextOptions);
  }

  const document = renderDocument(html);

  if (options?.pretty) {
    return pretty(document);
  }

  return document;
}

// API note: render accepts either a component function or an already
// constructed node. Keep that API while rendering through Solid SSR.
export async function render(
  node: Renderable,
  options?: Options,
): Promise<string> {
  let renderError: unknown;
  let hasError = false;
  const stream = renderToStream(normalizeRenderable(node), {
    ...solidRenderOptions,
    noScripts: true,
    onError(err) {
      hasError = true;
      renderError = err;
    },
  });
  const rawHtml = await stream;
  if (hasError) {
    throw renderError;
  }

  const html = removeSolidResourceScripts(rawHtml);
  return renderOutput(html, options);
}

export function renderSync(
  node: Renderable,
  options?: RenderSyncOptions,
): string {
  if (options?.pretty) {
    throw new Error('renderSync does not support pretty output; use render.');
  }

  const html = removeSolidResourceScripts(
    renderToString(normalizeRenderable(node), solidRenderOptions),
  );

  return renderSyncOutput(html, options);
}
