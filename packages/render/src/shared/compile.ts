import type { JSX } from 'solid-js';
import {
  renderToString,
  renderToStringAsync,
} from 'solid-js/web/dist/server.js';
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

    result = await this.replaceSlots(result, data);

    return renderOutput(result, options ?? this.options);
  }

  renderSync(data: TSlots, options?: RenderSyncOptions): string {
    if ((options ?? this.options)?.pretty) {
      throw new Error('renderSync does not support pretty output; use render.');
    }

    let result = this.html;

    result = this.replaceSlotsSync(result, data);

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

  private async replaceSlots(result: string, data: TSlots): Promise<string> {
    const replacements = new Map<string, string>();

    for (const [name, occurrences] of this.contentSlots) {
      const value = data[name as keyof TSlots] as SlotValue | undefined;
      if (value !== undefined) {
        const rendered = await renderSlotValueAsync(value);
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

  private replaceSlotsSync(result: string, data: TSlots): string {
    const replacements = new Map<string, string>();

    for (const [name, occurrences] of this.contentSlots) {
      const value = data[name as keyof TSlots] as SlotValue | undefined;
      if (value !== undefined) {
        const rendered = renderSlotValueSync(value);
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

async function renderSlotValueAsync(value: SlotValue): Promise<string> {
  if (value == null) return '';
  if (Array.isArray(value))
    return Promise.all(value.map(renderSlotValueAsync)).then((results) =>
      results.join(''),
    );
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return escapeHtml(value);
  if (typeof value === 'number') return String(value);
  const html = removeSolidResourceScripts(
    await renderToStringAsync(() => value as JSX.Element),
  );
  return html;
}

function renderSlotValueSync(value: SlotValue): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(renderSlotValueSync).join('');
  if (typeof value === 'boolean') return value ? 'true' : '';
  if (typeof value === 'string') return escapeHtml(value);
  if (typeof value === 'number') return String(value);
  const html = removeSolidResourceScripts(
    renderToString(() => value as JSX.Element),
  );
  return html;
}

function _renderSlotValue(value: SlotValue): string {
  return renderSlotValueSync(value);
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
