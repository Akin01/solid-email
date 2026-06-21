import type { JSX } from 'solid-js';
import { renderToString, renderToStringAsync } from 'solid-js/web';
import type { Options, RenderSyncOptions } from './options';
import { pretty } from './utils/pretty';
import { toPlainText } from './utils/to-plain-text';

export type Renderable = JSX.Element | (() => JSX.Element);

const doctype =
  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

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
  return html.replace(
    /<script>self\.\$R=self\.\$R\|\|\[\];[\s\S]*?<\/script>/g,
    '',
  );
}

export function renderDocument(html: string): string {
  return `${doctype}${html.replace(/<!DOCTYPE.*?>/, '')}`;
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
  const html = removeSolidResourceScripts(
    await renderToStringAsync(normalizeRenderable(node)),
  );

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
    renderToString(normalizeRenderable(node)),
  );

  return renderSyncOutput(html, options);
}
