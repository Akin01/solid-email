import type { HtmlToTextOptions } from '@solid-email/html-to-text';
import {
  renderSlotValueTextAsync,
  renderSlotValueTextSync,
  renderTextAttrValue,
  renderTextLinkHrefValue,
} from './slot-values';
import { decodeName, type SlotOccurrence, type SlotValue } from './slots';
import { toPlainText } from './utils/to-plain-text';

export type TextTemplateNode =
  | { type: 'text'; value: string }
  | { type: 'contentSlot'; name: string; fallback: TextTemplateNode[] }
  | { type: 'attrSlot'; name: string; marker: string }
  | { type: 'linkHrefSlot'; name: string; marker: string }
  | { type: 'conditionalSkip'; slotName: string; children: TextTemplateNode[] };

export type PlainTextTemplate = {
  nodes: TextTemplateNode[];
  usable: boolean;
};

type ParsedTextTemplate = {
  nodes: TextTemplateNode[];
  contentSlotCounts: Map<string, number>;
  attrMarkerCounts: Map<string, number>;
  linkMarkerCounts: Map<string, number>;
  conditionalCount: number;
  valid: boolean;
};

type TextTemplateFrame = {
  kind: 'root' | 'contentSlot' | 'conditionalSkip';
  encodedName?: string;
  name?: string;
  nodes: TextTemplateNode[];
};

const MARKER_NAME_CHARS = '(?:[A-Za-z0-9.~-]|%[0-9A-Fa-f]{2})+';
const CONTENT_START = '__SM_CNT_';
const CONTENT_END = '__SM_CNE_';
const ATTR_PREFIX = '__SM_ATR_';
const TEXT_SKIP_START = '__SM_TXS_';
const TEXT_SKIP_END = '__SM_TXE_';
const LINK_HREF_PREFIX = '__SM_LNK_';

function resolveContentSlotName(
  decodedName: string,
  contentSlots: Map<string, SlotOccurrence[]>,
): string {
  if (contentSlots.has(decodedName)) {
    return decodedName;
  }
  const lower = decodedName.toLowerCase();
  for (const name of contentSlots.keys()) {
    if (name.toLowerCase() === lower) {
      return name;
    }
  }
  return decodedName;
}

export function createPlainTextTemplate({
  html,
  options,
  contentSlots,
  attrSlots,
}: {
  html: string;
  options?: HtmlToTextOptions;
  contentSlots: Map<string, SlotOccurrence[]>;
  attrSlots: Map<string, string[]>;
}): PlainTextTemplate {
  const marked = markTextTemplateSlots(html, options);
  const text = toPlainText(marked.html, options);
  const parsed = parseTextTemplate(text, contentSlots);
  return {
    nodes: parsed.nodes,
    usable: canUsePlainTextTemplate({
      parsed,
      supportedAttrMarkerCounts: marked.supportedAttrMarkerCounts,
      expectedConditionalCount: marked.conditionalCount,
      expectedLinkMarkerCounts: marked.expectedLinkMarkerCounts,
      contentSlots,
      attrSlots,
    }),
  };
}

export async function renderTextTemplate<
  TSlots extends Record<string, SlotValue>,
>(
  nodes: TextTemplateNode[],
  data: TSlots,
  options?: HtmlToTextOptions,
): Promise<string> {
  const chunks: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        chunks.push(node.value);
        break;
      case 'contentSlot': {
        const value = data[node.name as keyof TSlots] as SlotValue | undefined;
        chunks.push(
          value !== undefined
            ? await renderSlotValueTextAsync(value, options)
            : await renderTextTemplate(node.fallback, data, options),
        );
        break;
      }
      case 'attrSlot': {
        const value = data[node.name as keyof TSlots] as SlotValue | undefined;
        chunks.push(renderTextAttrValue(node.name, value));
        break;
      }
      case 'linkHrefSlot': {
        const value = data[node.name as keyof TSlots] as SlotValue | undefined;
        chunks.push(renderTextLinkHrefValue(node.name, value));
        break;
      }
      case 'conditionalSkip': {
        const value = data[node.slotName as keyof TSlots] as
          | SlotValue
          | undefined;
        if (renderTextAttrValue(node.slotName, value) !== 'true') {
          chunks.push(await renderTextTemplate(node.children, data, options));
        }
        break;
      }
    }
  }

  return chunks.join('');
}

export function renderTextTemplateSync<
  TSlots extends Record<string, SlotValue>,
>(
  nodes: TextTemplateNode[],
  data: TSlots,
  options?: HtmlToTextOptions,
): string {
  const chunks: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        chunks.push(node.value);
        break;
      case 'contentSlot': {
        const value = data[node.name as keyof TSlots] as SlotValue | undefined;
        chunks.push(
          value !== undefined
            ? renderSlotValueTextSync(value, options)
            : renderTextTemplateSync(node.fallback, data, options),
        );
        break;
      }
      case 'attrSlot': {
        const value = data[node.name as keyof TSlots] as SlotValue | undefined;
        chunks.push(renderTextAttrValue(node.name, value));
        break;
      }
      case 'linkHrefSlot': {
        const value = data[node.name as keyof TSlots] as SlotValue | undefined;
        chunks.push(renderTextLinkHrefValue(node.name, value));
        break;
      }
      case 'conditionalSkip': {
        const value = data[node.slotName as keyof TSlots] as
          | SlotValue
          | undefined;
        if (renderTextAttrValue(node.slotName, value) !== 'true') {
          chunks.push(renderTextTemplateSync(node.children, data, options));
        }
        break;
      }
    }
  }

  return chunks.join('');
}

function canUsePlainTextTemplate({
  parsed,
  supportedAttrMarkerCounts,
  expectedConditionalCount,
  expectedLinkMarkerCounts,
  contentSlots,
  attrSlots,
}: {
  parsed: ParsedTextTemplate;
  supportedAttrMarkerCounts: Map<string, number>;
  expectedConditionalCount: number;
  expectedLinkMarkerCounts: Map<string, number>;
  contentSlots: Map<string, SlotOccurrence[]>;
  attrSlots: Map<string, string[]>;
}): boolean {
  if (!parsed.valid) return false;

  const remainingSupportedAttrMarkers = new Map(supportedAttrMarkerCounts);
  for (const attrMarkers of attrSlots.values()) {
    for (const marker of attrMarkers) {
      const remaining = remainingSupportedAttrMarkers.get(marker) ?? 0;
      if (remaining < 1) return false;
      remainingSupportedAttrMarkers.set(marker, remaining - 1);
    }
  }

  if (parsed.conditionalCount !== expectedConditionalCount) return false;
  if (parsed.attrMarkerCounts.size > 0) return false;

  for (const [marker, count] of expectedLinkMarkerCounts) {
    if ((parsed.linkMarkerCounts.get(marker) ?? 0) < count) return false;
  }

  for (const [name, occurrences] of contentSlots) {
    if ((parsed.contentSlotCounts.get(name) ?? 0) < occurrences.length) {
      return false;
    }
  }
  return true;
}

function markTextTemplateSlots(
  html: string,
  options?: HtmlToTextOptions,
): {
  html: string;
  supportedAttrMarkerCounts: Map<string, number>;
  expectedLinkMarkerCounts: Map<string, number>;
  conditionalCount: number;
} {
  const supportedAttrMarkerCounts = new Map<string, number>();
  const expectedLinkMarkerCounts = new Map<string, number>();
  let conditionalCount = 0;
  const incrementSupported = (marker: string) => {
    incrementCount(supportedAttrMarkerCounts, marker);
  };

  const dataSkipRegex = new RegExp(
    `<([A-Za-z][\\w:-]*)([^>]*)\\sdata-skip-in-text=(["'])(__SM_ATR_(${MARKER_NAME_CHARS})__)\\3([^>]*)>([\\s\\S]*?)</\\1>`,
    'g',
  );

  let markedHtml = html.replace(
    dataSkipRegex,
    (
      _match,
      tagName: string,
      beforeAttrs: string,
      _quote: string,
      marker: string,
      encodedName: string,
      afterAttrs: string,
      children: string,
    ) => {
      incrementSupported(marker);
      conditionalCount += 1;
      return `<${tagName}${beforeAttrs}${afterAttrs}>${TEXT_SKIP_START}${encodedName}__${children}${TEXT_SKIP_END}${encodedName}__</${tagName}>`;
    },
  );

  if (!options) {
    const linkHrefRegex = new RegExp(
      `<a([^>]*)\\shref=(["'])(__SM_ATR_(${MARKER_NAME_CHARS})__)\\2([^>]*)>([\\s\\S]*?)</a>`,
      'g',
    );
    markedHtml = markedHtml.replace(
      linkHrefRegex,
      (
        match,
        beforeAttrs: string,
        quote: string,
        marker: string,
        encodedName: string,
        afterAttrs: string,
        children: string,
      ) => {
        const sameContentMarker = `${CONTENT_START}${encodedName}__`;
        if (children.includes(sameContentMarker)) return match;

        incrementSupported(marker);
        incrementCount(expectedLinkMarkerCounts, marker);
        return `<a${beforeAttrs} href=${quote}${LINK_HREF_PREFIX}${encodedName}__${quote}${afterAttrs}>${children}</a>`;
      },
    );
  }

  return {
    html: markedHtml,
    supportedAttrMarkerCounts,
    expectedLinkMarkerCounts,
    conditionalCount,
  };
}

function parseTextTemplate(
  text: string,
  knownContentSlots?: Map<string, SlotOccurrence[]>,
): ParsedTextTemplate {
  const tokenRegex = new RegExp(
    `${escapeRegex(CONTENT_START)}(${MARKER_NAME_CHARS})__|${escapeRegex(CONTENT_END)}(${MARKER_NAME_CHARS})__|${escapeRegex(ATTR_PREFIX)}(${MARKER_NAME_CHARS})__|${escapeRegex(LINK_HREF_PREFIX)}(${MARKER_NAME_CHARS})__|${escapeRegex(TEXT_SKIP_START)}(${MARKER_NAME_CHARS})__|${escapeRegex(TEXT_SKIP_END)}(${MARKER_NAME_CHARS})__`,
    'g',
  );
  const root: TextTemplateFrame = { kind: 'root', nodes: [] };
  const stack = [root];
  const contentSlotCounts = new Map<string, number>();
  const attrMarkerCounts = new Map<string, number>();
  const linkMarkerCounts = new Map<string, number>();
  let conditionalCount = 0;
  let valid = true;
  let offset = 0;
  let match: RegExpExecArray | null;

  const currentNodes = () => stack[stack.length - 1]?.nodes ?? root.nodes;
  const addText = (value: string) => {
    if (!value) return;
    currentNodes().push({ type: 'text', value });
  };

  while (true) {
    match = tokenRegex.exec(text);
    if (match === null) break;

    addText(text.slice(offset, match.index));
    offset = tokenRegex.lastIndex;

    const [
      token,
      contentStart,
      contentEnd,
      attrName,
      linkName,
      conditionalStart,
      conditionalEnd,
    ] = match;

    if (contentStart !== undefined) {
      const decoded = decodeName(contentStart);
      const resolvedName = knownContentSlots
        ? resolveContentSlotName(decoded, knownContentSlots)
        : decoded;
      stack.push({
        kind: 'contentSlot',
        encodedName: contentStart,
        name: resolvedName,
        nodes: [],
      });
      continue;
    }

    if (contentEnd !== undefined) {
      const frame = stack[stack.length - 1];
      const isMatchingEnd =
        frame?.kind === 'contentSlot' &&
        frame.encodedName !== undefined &&
        (frame.encodedName === contentEnd ||
          frame.encodedName.toUpperCase() === contentEnd.toUpperCase());
      if (!frame || !isMatchingEnd || !frame.name) {
        valid = false;
        addText(token);
        continue;
      }
      stack.pop();
      currentNodes().push({
        type: 'contentSlot',
        name: frame.name,
        fallback: frame.nodes,
      });
      incrementCount(contentSlotCounts, frame.name);
      continue;
    }

    if (attrName !== undefined) {
      const marker = `${ATTR_PREFIX}${attrName}__`;
      currentNodes().push({
        type: 'attrSlot',
        name: decodeName(attrName),
        marker,
      });
      incrementCount(attrMarkerCounts, marker);
      continue;
    }

    if (linkName !== undefined) {
      const marker = `${ATTR_PREFIX}${linkName}__`;
      currentNodes().push({
        type: 'linkHrefSlot',
        name: decodeName(linkName),
        marker,
      });
      incrementCount(linkMarkerCounts, marker);
      continue;
    }

    if (conditionalStart !== undefined) {
      stack.push({
        kind: 'conditionalSkip',
        encodedName: conditionalStart,
        name: decodeName(conditionalStart),
        nodes: [],
      });
      continue;
    }

    if (conditionalEnd !== undefined) {
      const frame = stack[stack.length - 1];
      if (
        frame?.kind !== 'conditionalSkip' ||
        frame.encodedName !== conditionalEnd ||
        !frame.name
      ) {
        valid = false;
        addText(token);
        continue;
      }
      stack.pop();
      currentNodes().push({
        type: 'conditionalSkip',
        slotName: frame.name,
        children: frame.nodes,
      });
      conditionalCount += 1;
    }
  }

  addText(text.slice(offset));

  return {
    nodes: root.nodes,
    contentSlotCounts,
    attrMarkerCounts,
    linkMarkerCounts,
    conditionalCount,
    valid: valid && stack.length === 1,
  };
}

function incrementCount(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
