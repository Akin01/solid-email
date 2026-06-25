/*
 * Source licence: MIT.
 * Portions Copyright (c) 2012-2019 werk85 <malte@werk85.de>
 * Portions Copyright (c) 2020-2026 KillyMXI <killy@mxii.eu.org>
 */

import type { DomNode, MetaData, SelectorDefinition } from '../types.js';
import {
  BlockStackItem,
  type BuilderOptions,
  ListItemStackItem,
  ListStackItem,
  type StackItem,
  TableCellStackItem,
  type TablePrinter,
  TableRowStackItem,
  TableStackItem,
  TransformerStackItem,
  type WordTransform,
} from './stack-item.js';
import { trimCharacter } from './util.js';
import { WhitespaceProcessor } from './whitespace-processor.js';

type TextStackItem =
  | BlockStackItem
  | ListItemStackItem
  | ListStackItem
  | TableCellStackItem;
type TagDefinitionPicker = {
  pick1(elem: DomNode): SelectorDefinition;
};

type InlineOptions = {
  noWordTransform?: boolean | undefined;
};

type OpenBlockOptions = {
  leadingLineBreaks?: number | undefined;
  reservedLineLength?: number | undefined;
  isPre?: boolean | undefined;
};

type CloseBlockOptions = {
  trailingLineBreaks?: number | undefined;
  blockTransform?: WordTransform | undefined;
};

type OpenListOptions = {
  maxPrefixLength?: number | undefined;
  prefixAlign?: 'left' | 'right' | undefined;
  interRowLineBreaks?: number | undefined;
  leadingLineBreaks?: number | undefined;
};

type OpenListItemOptions = {
  prefix?: string | undefined;
};

type CloseListOptions = {
  trailingLineBreaks?: number | undefined;
};

type OpenTableCellOptions = {
  maxColumnWidth?: number | undefined;
};

type CloseTableCellOptions = {
  colspan?: number | undefined;
  rowspan?: number | undefined;
};

type CloseTableOptions = {
  tableToString: TablePrinter;
  leadingLineBreaks?: number | undefined;
  trailingLineBreaks?: number | undefined;
};

/**
 * Helps to build text from inline and block elements.
 */
class BlockTextBuilder {
  declare options: BuilderOptions;
  declare picker: TagDefinitionPicker;
  declare metadata: MetaData | undefined;
  declare whitespaceProcessor: WhitespaceProcessor;
  declare _stackItem: StackItem;
  declare _wordTransformer: TransformerStackItem | null | undefined;

  /**
   * Creates an instance of BlockTextBuilder.
   */
  constructor(
    options: BuilderOptions,
    picker: TagDefinitionPicker,
    metadata: MetaData | undefined = undefined,
  ) {
    this.options = options;
    this.picker = picker;
    this.metadata = metadata;
    this.whitespaceProcessor = new WhitespaceProcessor(options);
    this._stackItem = new BlockStackItem(options);
    this._wordTransformer = undefined;
  }

  /**
   * Put a word-by-word transform function onto the transformations stack.
   *
   * Mainly used for uppercasing. Can be bypassed to add unformatted text such as URLs.
   *
   * Word transformations applied before wrapping.
   */
  pushWordTransform(wordTransform: WordTransform): void {
    this._wordTransformer = new TransformerStackItem(
      this._wordTransformer,
      wordTransform,
    );
  }

  /**
   * Remove a function from the word transformations stack.
   */
  popWordTransform(): WordTransform | undefined {
    if (!this._wordTransformer) {
      return undefined;
    }
    const transform = this._wordTransformer.transform;
    this._wordTransformer = this._wordTransformer.next;
    return transform;
  }

  /**
   * Ignore wordwrap option in followup inline additions and disable automatic wrapping.
   */
  startNoWrap(): void {
    this._stackItem.isNoWrap = true;
  }

  /**
   * Return automatic wrapping to behavior defined by options.
   */
  stopNoWrap(): void {
    this._stackItem.isNoWrap = false;
  }

  _getCombinedWordTransformer(): WordTransform | undefined {
    const wt = this._wordTransformer
      ? (str: string) =>
          applyTransformer(str, this._wordTransformer as TransformerStackItem)
      : undefined;
    const ce = this.options.encodeCharacters as WordTransform | undefined;
    return wt ? (ce ? (str: string) => ce(wt(str)) : wt) : ce;
  }

  _popStackItem<T extends StackItem>(): T {
    const item = this._stackItem;
    this._stackItem = item.next as StackItem;
    return item as T;
  }

  /**
   * Add a line break into currently built block.
   */
  addLineBreak(): void {
    if (
      !(
        this._stackItem instanceof BlockStackItem ||
        this._stackItem instanceof ListItemStackItem ||
        this._stackItem instanceof TableCellStackItem
      )
    ) {
      return;
    }
    if (this._stackItem.isPre) {
      this._stackItem.rawText += '\n';
    } else {
      this._stackItem.inlineTextBuilder.startNewLine();
    }
  }

  /**
   * Allow to break line in case directly following text will not fit.
   */
  addWordBreakOpportunity(): void {
    if (
      this._stackItem instanceof BlockStackItem ||
      this._stackItem instanceof ListItemStackItem ||
      this._stackItem instanceof TableCellStackItem
    ) {
      this._stackItem.inlineTextBuilder.wordBreakOpportunity = true;
    }
  }

  /**
   * Add a node inline into the currently built block.
   */
  addInline(
    str: string,
    { noWordTransform = false }: InlineOptions = {},
  ): void {
    if (
      !(
        this._stackItem instanceof BlockStackItem ||
        this._stackItem instanceof ListItemStackItem ||
        this._stackItem instanceof TableCellStackItem
      )
    ) {
      return;
    }

    if (this._stackItem.isPre) {
      this._stackItem.rawText += str;
      return;
    }

    if (
      str.length === 0 || // empty string
      (this._stackItem.stashedLineBreaks && // stashed linebreaks make whitespace irrelevant
        !this.whitespaceProcessor.testContainsWords(str)) // no words to add
    ) {
      return;
    }

    if (this.options.preserveNewlines) {
      const newlinesNumber = this.whitespaceProcessor.countNewlinesNoWords(str);
      if (newlinesNumber > 0) {
        this._stackItem.inlineTextBuilder.startNewLine(newlinesNumber);
        // keep stashedLineBreaks unchanged
        return;
      }
    }

    if (this._stackItem.stashedLineBreaks) {
      this._stackItem.inlineTextBuilder.startNewLine(
        this._stackItem.stashedLineBreaks,
      );
    }
    this.whitespaceProcessor.shrinkWrapAdd(
      str,
      this._stackItem.inlineTextBuilder,
      noWordTransform ? undefined : this._getCombinedWordTransformer(),
      this._stackItem.isNoWrap as boolean | undefined,
    );
    this._stackItem.stashedLineBreaks = 0; // inline text doesn't introduce line breaks
  }

  /**
   * Add a string inline into the currently built block.
   *
   * Use this for markup elements that don't have to adhere
   * to text layout rules.
   */
  addLiteral(str: string): void {
    if (
      !(
        this._stackItem instanceof BlockStackItem ||
        this._stackItem instanceof ListItemStackItem ||
        this._stackItem instanceof TableCellStackItem
      )
    ) {
      return;
    }

    if (str.length === 0) {
      return;
    }

    if (this._stackItem.isPre) {
      this._stackItem.rawText += str;
      return;
    }

    if (this._stackItem.stashedLineBreaks) {
      this._stackItem.inlineTextBuilder.startNewLine(
        this._stackItem.stashedLineBreaks,
      );
    }
    this.whitespaceProcessor.addLiteral(
      str,
      this._stackItem.inlineTextBuilder,
      this._stackItem.isNoWrap as boolean | undefined,
    );
    this._stackItem.stashedLineBreaks = 0;
  }

  /**
   * Start building a new block.
   */
  openBlock({
    leadingLineBreaks = 1,
    reservedLineLength = 0,
    isPre = false,
  }: OpenBlockOptions = {}): void {
    const maxLineLength = Math.max(
      20,
      (this._stackItem as TextStackItem).inlineTextBuilder.maxLineLength -
        reservedLineLength,
    );
    this._stackItem = new BlockStackItem(
      this.options,
      this._stackItem,
      leadingLineBreaks,
      maxLineLength,
    );
    if (isPre) {
      this._stackItem.isPre = true;
    }
  }

  /**
   * Finalize currently built block, add it's content to the parent block.
   */
  closeBlock({
    trailingLineBreaks = 1,
    blockTransform = undefined,
  }: CloseBlockOptions = {}): void {
    const block = this._popStackItem<BlockStackItem>();
    const blockText = blockTransform
      ? blockTransform(getText(block))
      : getText(block);
    addText(
      this._stackItem,
      blockText,
      block.leadingLineBreaks,
      Math.max(block.stashedLineBreaks, trailingLineBreaks),
    );
  }

  /**
   * Start building a new list.
   */
  openList({
    maxPrefixLength = 0,
    prefixAlign = 'left',
    interRowLineBreaks = 1,
    leadingLineBreaks = 2,
  }: OpenListOptions = {}): void {
    this._stackItem = new ListStackItem(this.options, this._stackItem, {
      interRowLineBreaks: interRowLineBreaks,
      leadingLineBreaks: leadingLineBreaks,
      maxLineLength: (this._stackItem as TextStackItem).inlineTextBuilder
        .maxLineLength,
      maxPrefixLength: maxPrefixLength,
      prefixAlign: prefixAlign,
    });
  }

  /**
   * Start building a new list item.
   */
  openListItem({ prefix = '' }: OpenListItemOptions = {}): void {
    if (!(this._stackItem instanceof ListStackItem)) {
      throw new Error(
        "Can't add a list item to something that is not a list! Check the formatter.",
      );
    }
    const list = this._stackItem;
    const prefixLength = Math.max(prefix.length, list.maxPrefixLength);
    const maxLineLength = Math.max(
      20,
      list.inlineTextBuilder.maxLineLength - prefixLength,
    );
    this._stackItem = new ListItemStackItem(this.options, list, {
      prefix: prefix,
      maxLineLength: maxLineLength,
      leadingLineBreaks: list.interRowLineBreaks,
    });
  }

  /**
   * Finalize currently built list item, add it's content to the parent list.
   */
  closeListItem(): void {
    const listItem = this._popStackItem<ListItemStackItem>();
    const list = listItem.next;
    if (!list) {
      throw new Error("Can't close a list item without a parent list.");
    }

    const prefixLength = Math.max(listItem.prefix.length, list.maxPrefixLength);
    // biome-ignore lint/style/useTemplate: keep string concatenation readable here.
    const spacing = '\n' + ' '.repeat(prefixLength);
    const prefix =
      list.prefixAlign === 'right'
        ? listItem.prefix.padStart(prefixLength)
        : listItem.prefix.padEnd(prefixLength);
    const text = prefix + getText(listItem).replace(/\n/g, spacing);

    addText(
      list,
      text,
      listItem.leadingLineBreaks,
      Math.max(listItem.stashedLineBreaks, list.interRowLineBreaks),
    );
  }

  /**
   * Finalize currently built list, add it's content to the parent block.
   */
  closeList({ trailingLineBreaks = 2 }: CloseListOptions = {}): void {
    const list = this._popStackItem<ListStackItem>();
    const text = getText(list);
    if (text) {
      addText(
        this._stackItem,
        text,
        list.leadingLineBreaks,
        trailingLineBreaks,
      );
    }
  }

  /**
   * Start building a table.
   */
  openTable(): void {
    this._stackItem = new TableStackItem(this._stackItem);
  }

  /**
   * Start building a table row.
   */
  openTableRow(): void {
    if (!(this._stackItem instanceof TableStackItem)) {
      throw new Error(
        "Can't add a table row to something that is not a table! Check the formatter.",
      );
    }
    this._stackItem = new TableRowStackItem(this._stackItem);
  }

  /**
   * Start building a table cell.
   */
  openTableCell({
    maxColumnWidth = undefined,
  }: OpenTableCellOptions = {}): void {
    if (!(this._stackItem instanceof TableRowStackItem)) {
      throw new Error(
        "Can't add a table cell to something that is not a table row! Check the formatter.",
      );
    }
    this._stackItem = new TableCellStackItem(
      this.options,
      this._stackItem,
      maxColumnWidth,
    );
  }

  /**
   * Finalize currently built table cell and add it to parent table row's cells.
   */
  closeTableCell({
    colspan = 1,
    rowspan = 1,
  }: CloseTableCellOptions = {}): void {
    const cell = this._popStackItem<TableCellStackItem>();
    const text = trimCharacter(getText(cell), '\n');
    if (!cell.next) {
      throw new Error("Can't close a table cell without a parent row.");
    }
    cell.next.cells.push({ colspan: colspan, rowspan: rowspan, text: text });
  }

  /**
   * Finalize currently built table row and add it to parent table's rows.
   */
  closeTableRow(): void {
    const row = this._popStackItem<TableRowStackItem>();
    if (!row.next) {
      throw new Error("Can't close a table row without a parent table.");
    }
    row.next.rows.push(row.cells);
  }

  /**
   * Finalize currently built table and add the rendered text to the parent block.
   */
  closeTable({
    tableToString,
    leadingLineBreaks = 2,
    trailingLineBreaks = 2,
  }: CloseTableOptions): void {
    const table = this._popStackItem<TableStackItem>();
    const output = tableToString(table.rows);
    if (output) {
      addText(this._stackItem, output, leadingLineBreaks, trailingLineBreaks);
    }
  }

  /**
   * Return the rendered text content of this builder.
   */
  toString(): string {
    return getText(this._stackItem.getRoot());
    // There should only be the root item if everything is closed properly.
  }
}

function getText(stackItem: StackItem): string {
  if (
    !(
      stackItem instanceof BlockStackItem ||
      stackItem instanceof ListItemStackItem ||
      stackItem instanceof TableCellStackItem
    )
  ) {
    throw new Error(
      'Only blocks, list items and table cells can be requested for text contents.',
    );
  }
  return stackItem.inlineTextBuilder.isEmpty()
    ? stackItem.rawText
    : stackItem.rawText + stackItem.inlineTextBuilder.toString();
}

function addText(
  stackItem: StackItem,
  text: string,
  leadingLineBreaks: number,
  trailingLineBreaks: number,
): void {
  if (
    !(
      stackItem instanceof BlockStackItem ||
      stackItem instanceof ListItemStackItem ||
      stackItem instanceof TableCellStackItem
    )
  ) {
    throw new Error(
      'Only blocks, list items and table cells can contain text.',
    );
  }
  const parentText = getText(stackItem);
  const lineBreaks = Math.max(stackItem.stashedLineBreaks, leadingLineBreaks);
  stackItem.inlineTextBuilder.clear();
  if (parentText) {
    stackItem.rawText = parentText + '\n'.repeat(lineBreaks) + text;
  } else {
    stackItem.rawText = text;
    stackItem.leadingLineBreaks = lineBreaks;
  }
  stackItem.stashedLineBreaks = trailingLineBreaks;
}

function applyTransformer(
  str: string,
  transformer: TransformerStackItem | null | undefined,
): string {
  return transformer
    ? applyTransformer(transformer.transform(str), transformer.next)
    : str;
}

export type {
  CloseBlockOptions,
  CloseListOptions,
  CloseTableCellOptions,
  CloseTableOptions,
  InlineOptions,
  OpenBlockOptions,
  OpenListItemOptions,
  OpenListOptions,
  OpenTableCellOptions,
  TagDefinitionPicker,
};
export { BlockTextBuilder };
