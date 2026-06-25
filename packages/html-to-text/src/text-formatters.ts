/*
 * Source licence: MIT.
 * Portions Copyright (c) 2012-2019 werk85 <malte@werk85.de>
 * Portions Copyright (c) 2020-2026 KillyMXI <killy@mxii.eu.org>
 */

import {
  get,
  numberToLetterSequence,
  numberToRoman,
  trimCharacter,
  trimCharacterEnd,
} from './base/util.js';

import { tableToString } from './table-printer.js';

import type {
  BlockTextBuilder,
  DomNode,
  FormatOptions,
  MetaData,
  RecursiveCallback,
  TablePrinterCell,
} from './types.js';

/**
 * Process a line-break.
 *
 * @type { FormatCallback }
 */
function formatLineBreak(
  _elem: DomNode,
  _walk: RecursiveCallback,
  builder: BlockTextBuilder,
  _formatOptions: FormatOptions,
): void {
  builder.addLineBreak();
}

/**
 * Process a `wbr` tag (word break opportunity).
 *
 * @type { FormatCallback }
 */
function formatWbr(
  _elem: DomNode,
  _walk: RecursiveCallback,
  builder: BlockTextBuilder,
  _formatOptions: FormatOptions,
): void {
  builder.addWordBreakOpportunity();
}

/**
 * Process a horizontal line.
 *
 * @type { FormatCallback }
 */
function formatHorizontalLine(
  _elem: DomNode,
  _walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  builder.openBlock({
    leadingLineBreaks: formatOptions.leadingLineBreaks || 2,
  });
  builder.addInline(
    '-'.repeat(formatOptions.length || builder.options.wordwrap || 40),
  );
  builder.closeBlock({
    trailingLineBreaks: formatOptions.trailingLineBreaks || 2,
  });
}

/**
 * Process a paragraph.
 *
 * @type { FormatCallback }
 */
function formatParagraph(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  builder.openBlock({
    leadingLineBreaks: formatOptions.leadingLineBreaks || 2,
  });
  walk(elem.children, builder);
  builder.closeBlock({
    trailingLineBreaks: formatOptions.trailingLineBreaks || 2,
  });
}

/**
 * Process a preformatted content.
 *
 * @type { FormatCallback }
 */
function formatPre(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  builder.openBlock({
    isPre: true,
    leadingLineBreaks: formatOptions.leadingLineBreaks || 2,
  });
  walk(elem.children, builder);
  builder.closeBlock({
    trailingLineBreaks: formatOptions.trailingLineBreaks || 2,
  });
}

/**
 * Process a heading.
 *
 * @type { FormatCallback }
 */
function formatHeading(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  builder.openBlock({
    leadingLineBreaks: formatOptions.leadingLineBreaks || 2,
  });
  if (formatOptions.uppercase !== false) {
    builder.pushWordTransform((str) => str.toUpperCase());
    walk(elem.children, builder);
    builder.popWordTransform();
  } else {
    walk(elem.children, builder);
  }
  builder.closeBlock({
    trailingLineBreaks: formatOptions.trailingLineBreaks || 2,
  });
}

/**
 * Process a blockquote.
 *
 * @type { FormatCallback }
 */
function formatBlockquote(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  builder.openBlock({
    leadingLineBreaks: formatOptions.leadingLineBreaks || 2,
    reservedLineLength: 2,
  });
  walk(elem.children, builder);
  builder.closeBlock({
    trailingLineBreaks: formatOptions.trailingLineBreaks || 2,
    blockTransform: (str) =>
      (formatOptions.trimEmptyLines !== false ? trimCharacter(str, '\n') : str)
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n'),
  });
}

function withBrackets(
  str: string,
  brackets: FormatOptions['linkBrackets'],
): string {
  if (!brackets) {
    return str;
  }

  const lbr = typeof brackets[0] === 'string' ? brackets[0] : '[';
  const rbr = typeof brackets[1] === 'string' ? brackets[1] : ']';
  return lbr + str + rbr;
}

function pathRewrite(
  path: string,
  rewriter: FormatOptions['pathRewrite'],
  baseUrl: FormatOptions['baseUrl'],
  metadata: MetaData,
  elem: DomNode,
): string {
  const modifiedPath =
    typeof rewriter === 'function' ? rewriter(path, metadata, elem) : path;
  return modifiedPath[0] === '/' && baseUrl
    ? trimCharacterEnd(baseUrl, '/') + modifiedPath
    : modifiedPath;
}

/**
 * Process an image.
 *
 * @type { FormatCallback }
 */
function formatImage(
  elem: DomNode,
  _walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  const attribs = elem.attribs || {};
  const alt = attribs.alt ? attribs.alt : '';
  const src = !attribs.src
    ? ''
    : pathRewrite(
        attribs.src,
        formatOptions.pathRewrite,
        formatOptions.baseUrl,
        builder.metadata,
        elem,
      );
  const text = !src
    ? alt
    : !alt
      ? withBrackets(src, formatOptions.linkBrackets)
      : `${alt} ${withBrackets(src, formatOptions.linkBrackets)}`;

  builder.addInline(text, { noWordTransform: true });
}

/**
 * Process an anchor.
 *
 * @type { FormatCallback }
 */
function formatAnchor(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  function getHref(): string {
    if (formatOptions.ignoreHref) {
      return '';
    }
    if (!elem.attribs?.href) {
      return '';
    }
    let href = elem.attribs.href.replace(/^mailto:/, '');
    if (formatOptions.noAnchorUrl && href[0] === '#') {
      return '';
    }
    href = pathRewrite(
      href,
      formatOptions.pathRewrite,
      formatOptions.baseUrl,
      builder.metadata,
      elem,
    );
    return href;
  }
  const href = getHref();
  if (!href) {
    walk(elem.children, builder);
  } else {
    let text = '';
    builder.pushWordTransform((str) => {
      if (str) {
        text += str;
      }
      return str;
    });
    walk(elem.children, builder);
    builder.popWordTransform();

    const hideSameLink =
      formatOptions.hideLinkHrefIfSameAsText && href === text;
    if (!hideSameLink) {
      builder.addInline(
        !text ? href : ` ${withBrackets(href, formatOptions.linkBrackets)}`,
        { noWordTransform: true },
      );
    }
  }
}

/**
 * @param { DomNode }           elem               List items with their prefixes.
 * @param { RecursiveCallback } walk               Recursive callback to process child nodes.
 * @param { BlockTextBuilder }  builder            Passed around to accumulate output text.
 * @param { FormatOptions }     formatOptions      Options specific to a formatter.
 * @param { () => string }      nextPrefixCallback Function that returns increasing index each time it is called.
 */
function formatList(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
  nextPrefixCallback: () => string,
): void {
  const isNestedList = get(elem, ['parent', 'name']) === 'li';

  // With Roman numbers, index length is not as straightforward as with Arabic numbers or letters,
  // so the dumb length comparison is the most robust way to get the correct value.
  let maxPrefixLength = 0;
  const listItems: Array<{ node: DomNode; prefix: string }> = [];
  for (const child of elem.children || []) {
    // it might be more accurate to check only for html spaces here, but no significant benefit
    if (child.type === 'text' && /^\s*$/.test(String(child.data))) {
      continue;
    }
    if (child.name !== 'li') {
      listItems.push({ node: child, prefix: '' });
      continue;
    }
    const prefix = isNestedList
      ? nextPrefixCallback().trimStart()
      : nextPrefixCallback();
    if (prefix.length > maxPrefixLength) {
      maxPrefixLength = prefix.length;
    }
    listItems.push({ node: child, prefix: prefix });
  }
  if (!listItems.length) {
    return;
  }

  builder.openList({
    interRowLineBreaks: 1,
    leadingLineBreaks: isNestedList ? 1 : formatOptions.leadingLineBreaks || 2,
    maxPrefixLength: maxPrefixLength,
    prefixAlign: 'left',
  });

  for (const { node, prefix } of listItems) {
    builder.openListItem({ prefix: prefix });
    walk([node], builder);
    builder.closeListItem();
  }

  builder.closeList({
    trailingLineBreaks: isNestedList
      ? 1
      : formatOptions.trailingLineBreaks || 2,
  });
}

/**
 * Process an unordered list.
 *
 * @type { FormatCallback }
 */
function formatUnorderedList(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  const prefix = formatOptions.itemPrefix || ' * ';
  formatList(elem, walk, builder, formatOptions, () => prefix);
}

/**
 * Process an ordered list.
 *
 * @type { FormatCallback }
 */
function formatOrderedList(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  let nextIndex = Number(elem.attribs?.start || '1');
  const indexFunction = getOrderedListIndexFunction(elem.attribs?.type);
  const nextPrefixCallback = () => ` ${indexFunction(nextIndex++)}. `;
  formatList(elem, walk, builder, formatOptions, nextPrefixCallback);
}

/**
 * Return a function that can be used to generate index markers of a specified format.
 *
 * @param   { string } [olType] Marker type.
 * @returns { (i: number) => string }
 */
function getOrderedListIndexFunction(olType = '1'): (index: number) => string {
  switch (olType) {
    case 'a':
      return (i) => numberToLetterSequence(i, 'a');
    case 'A':
      return (i) => numberToLetterSequence(i, 'A');
    case 'i':
      return (i) => numberToRoman(i).toLowerCase();
    case 'I':
      return (i) => numberToRoman(i);

    default:
      return (i) => i.toString();
  }
}

function formatBlock(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks });
  walk(elem.children, builder);
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks });
}

/**
 * Process a data table.
 *
 * @type { FormatCallback }
 */
function formatDataTable(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
): void {
  builder.openTable();
  elem.children?.forEach(walkTable);
  builder.closeTable({
    tableToString: (rows: TablePrinterCell[][]) =>
      tableToString(
        rows,
        formatOptions.rowSpacing ?? 0,
        formatOptions.colSpacing ?? 3,
      ),
    leadingLineBreaks: formatOptions.leadingLineBreaks,
    trailingLineBreaks: formatOptions.trailingLineBreaks,
  });

  function formatCell(cellNode: DomNode): void {
    const attribs = cellNode.attribs;
    const colspan = (attribs && +(attribs.colspan as string)) || 1;
    const rowspan = (attribs && +(attribs.rowspan as string)) || 1;
    builder.openTableCell({ maxColumnWidth: formatOptions.maxColumnWidth });
    walk(cellNode.children, builder);
    builder.closeTableCell({ colspan: colspan, rowspan: rowspan });
  }

  function walkTable(elem: DomNode): void {
    if (elem.type !== 'tag') {
      return;
    }

    const formatHeaderCell: (cellNode: DomNode) => void =
      formatOptions.uppercaseHeaderCells !== false
        ? (cellNode: DomNode) => {
            builder.pushWordTransform((str) => str.toUpperCase());
            formatCell(cellNode);
            builder.popWordTransform();
          }
        : formatCell;

    switch (elem.name) {
      case 'thead':
      case 'tbody':
      case 'tfoot':
      case 'center':
        elem.children?.forEach(walkTable);
        return;

      case 'tr': {
        builder.openTableRow();
        for (const childOfTr of elem.children ?? []) {
          if (childOfTr.type !== 'tag') {
            continue;
          }
          switch (childOfTr.name) {
            case 'th': {
              formatHeaderCell(childOfTr);
              break;
            }
            case 'td': {
              formatCell(childOfTr);
              break;
            }
            default:
            // do nothing
          }
        }
        builder.closeTableRow();
        break;
      }

      default:
      // do nothing
    }
  }
}

export {
  formatAnchor as anchor,
  formatBlock as table,
  formatBlockquote as blockquote,
  formatDataTable as dataTable,
  formatHeading as heading,
  formatHorizontalLine as horizontalLine,
  formatImage as image,
  formatLineBreak as lineBreak,
  formatOrderedList as orderedList,
  formatParagraph as paragraph,
  formatPre as pre,
  formatUnorderedList as unorderedList,
  formatWbr as wbr,
};
