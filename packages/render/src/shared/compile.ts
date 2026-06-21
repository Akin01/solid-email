import type { JSX } from 'solid-js';
import { renderToString, renderToStringAsync } from 'solid-js/web/dist/server.js';
import type { Options, RenderSyncOptions } from './options';
import type { Renderable } from './render';
import {
  normalizeRenderable,
  removeSolidResourceScripts,
  renderOutput,
  renderSyncOutput,
} from './render';
import { buildSlotLookup, type SlotOccurrence, type SlotValue } from './slots';

export type { SlotRecord, SlotValue } from './slots';

export class CompiledTemplate<
  TSlots extends Record<string, SlotValue> = Record<string, SlotValue>,
> {
  private readonly html: string;
  private readonly options?: Options;
  private readonly contentSlots: Map<string, SlotOccurrence[]>;
  private readonly attrSlots: Map<string, string[]>;
  private readonly markerRegex: RegExp;

  constructor(html: string, options?: Options) {
    this.html = html;
    this.options = options;
    const lookup = buildSlotLookup(html);
    this.contentSlots = lookup.content;
    this.attrSlots = lookup.attr;
    this.markerRegex = this.buildMarkerRegex();
  }

  async render(data: TSlots, options?: Options): Promise<string> {
    let result = this.html;

    result = this.replaceSlots(result, data);

    return renderOutput(result, options ?? this.options);
  }

  renderSync(data: TSlots, options?: RenderSyncOptions): string {
    if ((options ?? this.options)?.pretty) {
      throw new Error('renderSync does not support pretty output; use render.');
    }

    let result = this.html;

    result = this.replaceSlots(result, data);

    return renderSyncOutput(
      result,
      options ?? (this.options as RenderSyncOptions),
    );
  }

  private buildMarkerRegex(): RegExp {
    const markers = new Set<string>();
    for (const occurrences of this.contentSlots.values()) {
      for (const occ of occurrences) {
        markers.add(occ.full);
      }
    }
    for (const attrMarkers of this.attrSlots.values()) {
      for (const marker of attrMarkers) {
        markers.add(marker);
      }
    }

    if (markers.size === 0) {
      return /$^/g;
    }

    return new RegExp(
      Array.from(markers)
        .sort((a, b) => b.length - a.length)
        .map(escapeRegex)
        .join('|'),
      'g',
    );
  }

  private replaceSlots(result: string, data: TSlots): string {
    const replacements = new Map<string, string>();

    for (const [name, occurrences] of this.contentSlots) {
      const value = data[name as keyof TSlots] as SlotValue | undefined;
      if (value !== undefined) {
        const rendered = renderSlotValue(value);
        for (const occ of occurrences) {
          replacements.set(occ.full, rendered);
        }
      } else {
        for (const occ of occurrences) {
          replacements.set(occ.full, occ.defaultValue);
        }
      }
    }

    for (const [name, markers] of this.attrSlots) {
      const value = data[name as keyof TSlots] as SlotValue | undefined;
      const replacement = renderAttrValue(value);
      for (const marker of markers) {
        replacements.set(marker, replacement);
      }
    }

    if (replacements.size === 0) return result;

    return result.replace(
      this.markerRegex,
      (marker) => replacements.get(marker) ?? marker,
    );
  }
}

function renderSlotValue(value: SlotValue): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(renderSlotValue).join('');
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return escapeHtml(value);
  if (typeof value === 'number') return String(value);
  const html = removeSolidResourceScripts(
    renderToString(() => value as JSX.Element),
  );
  return html;
}

function renderAttrValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return escapeAttr(value);
  if (typeof value === 'number') return String(value);
  return '';
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

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function compile<
  TSlots extends Record<string, SlotValue> = Record<string, SlotValue>,
>(node: Renderable, options?: Options): Promise<CompiledTemplate<TSlots>> {
  const html = removeSolidResourceScripts(
    await renderToStringAsync(normalizeRenderable(node)),
  );
  return new CompiledTemplate<TSlots>(html, options);
}

export function compileSync<
  TSlots extends Record<string, SlotValue> = Record<string, SlotValue>,
>(node: Renderable, options?: RenderSyncOptions): CompiledTemplate<TSlots> {
  if (options?.pretty) {
    throw new Error('compileSync does not support pretty output; use compile.');
  }
  const html = removeSolidResourceScripts(
    renderToString(normalizeRenderable(node)),
  );
  return new CompiledTemplate<TSlots>(html, options);
}
