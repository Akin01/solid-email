import {
  renderAttrValue,
  renderSlotValueAsync,
  renderSlotValueSync,
} from './slot-values';
import type { SlotOccurrence, SlotValue } from './slots';

export type SlotLookup = {
  content: Map<string, SlotOccurrence[]>;
  attr: Map<string, string[]>;
  requiredSlots?: string[];
};

export function buildMarkerRegex(lookup: SlotLookup): RegExp {
  const markers = new Set<string>();
  for (const occurrences of lookup.content.values()) {
    for (const occ of occurrences) {
      markers.add(occ.full);
    }
  }
  for (const attrMarkers of lookup.attr.values()) {
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

export function validateSlots<TSlots extends Record<string, SlotValue>>(
  data: TSlots,
  lookup: SlotLookup,
): void {
  const requiredSlots = lookup.requiredSlots;
  if (requiredSlots) {
    for (const name of requiredSlots) {
      if ((data as Record<string, unknown>)[name] === undefined) {
        console.warn(
          `[solid-email] Slot "${name}" has no default and was not provided in render data. It will render as empty.`,
        );
      }
    }
    return;
  }

  const allSlotNames = new Set([
    ...lookup.content.keys(),
    ...lookup.attr.keys(),
  ]);

  for (const name of allSlotNames) {
    const value = (data as Record<string, unknown>)[name];

    if (value === undefined) {
      const hasDefault =
        lookup.content.get(name)?.some((occ) => occ.hasDefault) ?? false;
      if (!hasDefault) {
        console.warn(
          `[solid-email] Slot "${name}" has no default and was not provided in render data. It will render as empty.`,
        );
      }
    }
  }
}

export async function replaceSlots<TSlots extends Record<string, SlotValue>>({
  result,
  data,
  lookup,
  markerRegex,
  validate,
}: {
  result: string;
  data: TSlots;
  lookup: SlotLookup;
  markerRegex: RegExp;
  validate: boolean;
}): Promise<string> {
  if (validate) validateSlots(data, lookup);
  const replacements: Record<string, string> = Object.create(null);
  let replacementCount = 0;

  for (const [name, occurrences] of lookup.content) {
    const value = data[name as keyof TSlots] as SlotValue | undefined;
    const rendered =
      value !== undefined ? await renderSlotValueAsync(value) : undefined;
    for (const occ of occurrences) {
      if (!result.includes(occ.full)) continue;
      const replacement =
        rendered ??
        (await replaceSlots({
          result: occ.defaultValue,
          data,
          lookup,
          markerRegex,
          validate: false,
        }));
      replacements[occ.full] = replacement;
      replacementCount++;
    }
  }

  for (const [name, markers] of lookup.attr) {
    const value = data[name as keyof TSlots] as SlotValue | undefined;
    const replacement = renderAttrValue(name, value);
    for (const marker of markers) {
      replacements[marker] = replacement;
      replacementCount++;
    }
  }

  if (replacementCount === 0) return result;

  return result.replace(
    markerRegex,
    (marker) => replacements[marker] ?? marker,
  );
}

export function replaceSlotsSync<TSlots extends Record<string, SlotValue>>({
  result,
  data,
  lookup,
  markerRegex,
  validate,
}: {
  result: string;
  data: TSlots;
  lookup: SlotLookup;
  markerRegex: RegExp;
  validate: boolean;
}): string {
  if (validate) validateSlots(data, lookup);
  const replacements: Record<string, string> = Object.create(null);
  let replacementCount = 0;

  for (const [name, occurrences] of lookup.content) {
    const value = data[name as keyof TSlots] as SlotValue | undefined;
    const rendered =
      value !== undefined ? renderSlotValueSync(value) : undefined;
    for (const occ of occurrences) {
      if (!result.includes(occ.full)) continue;
      const replacement =
        rendered ??
        replaceSlotsSync({
          result: occ.defaultValue,
          data,
          lookup,
          markerRegex,
          validate: false,
        });
      replacements[occ.full] = replacement;
      replacementCount++;
    }
  }

  for (const [name, markers] of lookup.attr) {
    const value = data[name as keyof TSlots] as SlotValue | undefined;
    const replacement = renderAttrValue(name, value);
    for (const marker of markers) {
      replacements[marker] = replacement;
      replacementCount++;
    }
  }

  if (replacementCount === 0) return result;

  return result.replace(
    markerRegex,
    (marker) => replacements[marker] ?? marker,
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
