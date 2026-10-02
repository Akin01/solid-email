import type { HtmlToTextOptions } from '@solid-email/html-to-text';
import type { JSX } from '@solidjs/web';
import { renderToStream, renderToString } from '@solidjs/web';
import { removeSolidResourceScripts } from './render';
import type { SlotValue } from './slots';
import { toPlainText } from './utils/to-plain-text';

function extractSsrHtml(value: unknown): string | undefined {
  if (value && typeof value === 'object' && 't' in value) {
    const text = value.t;
    if (typeof text === 'string') {
      return text;
    }
  }
  return undefined;
}

export async function renderSlotValueAsync(value: SlotValue): Promise<string> {
  if (value == null) return '';
  if (Array.isArray(value)) {
    return Promise.all(value.map(renderSlotValueAsync)).then((results) =>
      results.join(''),
    );
  }
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return escapeHtml(value);
  if (typeof value === 'number') return String(value);
  const ssrHtml = extractSsrHtml(value);
  if (ssrHtml !== undefined) return removeSolidResourceScripts(ssrHtml);
  return removeSolidResourceScripts(
    await renderToStream(() => value as JSX.Element, { noScripts: true }),
  );
}

export function renderSlotValueSync(value: SlotValue): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(renderSlotValueSync).join('');
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return escapeHtml(value);
  if (typeof value === 'number') return String(value);
  const ssrHtml = extractSsrHtml(value);
  if (ssrHtml !== undefined) return removeSolidResourceScripts(ssrHtml);
  return removeSolidResourceScripts(renderToString(() => value as JSX.Element));
}

export async function renderSlotValueTextAsync(
  value: SlotValue,
  options?: HtmlToTextOptions,
): Promise<string> {
  if (value == null) return '';
  if (Array.isArray(value)) {
    const results = await Promise.all(
      value.map((item) => renderSlotValueTextAsync(item, options)),
    );
    return results.join('');
  }
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  const ssrHtml = extractSsrHtml(value);
  const html =
    ssrHtml !== undefined
      ? removeSolidResourceScripts(ssrHtml)
      : removeSolidResourceScripts(
          await renderToStream(() => value as JSX.Element, { noScripts: true }),
        );
  return toPlainText(html, options);
}

export function renderSlotValueTextSync(
  value: SlotValue,
  options?: HtmlToTextOptions,
): string {
  if (value == null) return '';
  if (Array.isArray(value)) {
    return value.map((item) => renderSlotValueTextSync(item, options)).join('');
  }
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  const ssrHtml = extractSsrHtml(value);
  const html =
    ssrHtml !== undefined
      ? removeSolidResourceScripts(ssrHtml)
      : removeSolidResourceScripts(renderToString(() => value as JSX.Element));
  return toPlainText(html, options);
}

export function renderAttrValue(name: string, value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return escapeAttr(value);
  if (typeof value === 'number') return String(value);
  throw new TypeError(
    `Attribute slot "${name}" only accepts string, number, boolean, null, or undefined. Use <Slot name="${name}" /> for JSX/content values.`,
  );
}

export function renderTextAttrValue(name: string, value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  throw new TypeError(
    `Attribute slot "${name}" only accepts string, number, boolean, null, or undefined. Use <Slot name="${name}" /> for JSX/content values.`,
  );
}

export function renderTextLinkHrefValue(name: string, value: unknown): string {
  const href = renderTextAttrValue(name, value).replace(/^mailto:/, '');
  return href.startsWith('#') ? '' : href;
}

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttr(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
