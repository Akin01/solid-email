export type CharacterEncoder = (str: string) => string;
export type EncodeCharacters =
  | Record<string, string | false>
  | CharacterEncoder
  | undefined;

export type CompiledFunction = (html: string, metadata?: MetaData) => string;
export type MetaData = unknown;

export interface HtmlToTextOptions {
  baseElements?: BaseElementsOptions | undefined;
  decodeEntities?: boolean | undefined;
  encodeCharacters?: EncodeCharacters;
  formatters?: Record<string, FormatCallback> | undefined;
  limits?: LimitsOptions | undefined;
  longWordSplit?: LongWordSplitOptions | undefined;
  preserveNewlines?: boolean | undefined;
  selectors?: SelectorDefinition[] | undefined;
  whitespaceCharacters?: string | undefined;
  wordwrap?: number | false | null | undefined;
}

export interface CompiledHtmlToTextOptions extends HtmlToTextOptions {
  baseElements: RequiredBaseElementsOptions;
  decodeEntities: boolean;
  formatters: Record<string, FormatCallback>;
  limits: RequiredLimitsOptions;
  longWordSplit: RequiredLongWordSplitOptions;
  preserveNewlines: boolean;
  selectors: SelectorDefinition[];
  whitespaceCharacters: string;
  wordwrap: number | false | null;
}

export interface BaseElementsOptions {
  selectors?: string[] | undefined;
  orderBy?: 'selectors' | 'occurrence' | undefined;
  returnDomByDefault?: boolean | undefined;
}

export interface RequiredBaseElementsOptions {
  selectors: string[];
  orderBy: 'selectors' | 'occurrence';
  returnDomByDefault: boolean;
}

export interface LimitsOptions {
  ellipsis?: string | undefined;
  maxBaseElements?: number | undefined;
  maxChildNodes?: number | undefined;
  maxDepth?: number | undefined;
  maxInputLength?: number | undefined;
}

export interface RequiredLimitsOptions {
  ellipsis: string;
  maxBaseElements: number | undefined;
  maxChildNodes: number | undefined;
  maxDepth: number | undefined;
  maxInputLength: number | undefined;
}

export interface LongWordSplitOptions {
  forceWrapOnLimit?: boolean | undefined;
  wrapCharacters?: string[] | undefined;
}

export interface RequiredLongWordSplitOptions {
  forceWrapOnLimit: boolean;
  wrapCharacters: string[];
}

export interface SelectorDefinition {
  selector: string;
  format?: string | undefined;
  options?: FormatOptions | undefined;
}

export interface FormatOptions {
  leadingLineBreaks?: number | undefined;
  trailingLineBreaks?: number | undefined;
  baseUrl?: string | null | undefined;
  linkBrackets?: [string, string] | false | undefined;
  pathRewrite?:
    | ((path: string, meta: MetaData, elem?: DomNode) => string)
    | undefined;
  hideLinkHrefIfSameAsText?: boolean | undefined;
  ignoreHref?: boolean | undefined;
  noAnchorUrl?: boolean | undefined;
  itemPrefix?: string | undefined;
  uppercase?: boolean | undefined;
  length?: number | undefined;
  trimEmptyLines?: boolean | undefined;
  uppercaseHeaderCells?: boolean | undefined;
  maxColumnWidth?: number | undefined;
  colSpacing?: number | undefined;
  rowSpacing?: number | undefined;
  string?: string | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  [key: string]: unknown;
}

export interface DomNode {
  type: string;
  data?: string | undefined;
  name?: string | undefined;
  attribs?: Record<string, string> | undefined;
  children?: DomNode[] | undefined;
  parent?: DomNode | undefined;
}

export interface TablePrinterCell {
  colspan: number;
  rowspan: number;
  text: string;
  lines?: string[] | undefined;
  rendered?: boolean | undefined;
}

export type TablePrinter = (tableRows: TablePrinterCell[][]) => string;

export interface AddInlineOptions {
  noWordTransform?: boolean | undefined;
}

export interface OpenBlockOptions {
  leadingLineBreaks?: number | undefined;
  reservedLineLength?: number | undefined;
  isPre?: boolean | undefined;
}

export interface CloseBlockOptions {
  trailingLineBreaks?: number | undefined;
  blockTransform?: ((str: string) => string) | undefined;
}

export interface OpenListOptions {
  maxPrefixLength?: number | undefined;
  prefixAlign?: 'left' | 'right' | undefined;
  interRowLineBreaks?: number | undefined;
  leadingLineBreaks?: number | undefined;
}

export interface OpenListItemOptions {
  prefix?: string | undefined;
}

export interface CloseListOptions {
  trailingLineBreaks?: number | undefined;
}

export interface OpenTableCellOptions {
  maxColumnWidth?: number | undefined;
}

export interface CloseTableCellOptions {
  colspan?: number | undefined;
  rowspan?: number | undefined;
}

export interface CloseTableOptions {
  tableToString: TablePrinter;
  leadingLineBreaks?: number | undefined;
  trailingLineBreaks?: number | undefined;
}

export interface BlockTextBuilder {
  options: CompiledHtmlToTextOptions;
  metadata?: MetaData | undefined;
  addInline(str: string, options?: AddInlineOptions): void;
  addLineBreak(): void;
  addLiteral(str: string): void;
  addWordBreakOpportunity(): void;
  closeBlock(options?: CloseBlockOptions): void;
  closeList(options?: CloseListOptions): void;
  closeListItem(): void;
  closeTable(options: CloseTableOptions): void;
  closeTableCell(options?: CloseTableCellOptions): void;
  closeTableRow(): void;
  openBlock(options?: OpenBlockOptions): void;
  openList(options?: OpenListOptions): void;
  openListItem(options?: OpenListItemOptions): void;
  openTable(): void;
  openTableRow(): void;
  openTableCell(options?: OpenTableCellOptions): void;
  popWordTransform(): ((str: string) => string) | undefined;
  pushWordTransform(wordTransform: (str: string) => string): void;
  startNoWrap(): void;
  stopNoWrap(): void;
  toString(): string;
}

export type FormatCallback = (
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions,
) => void;

export type RecursiveCallback = (
  nodes: DomNode[] | undefined,
  builder: BlockTextBuilder,
) => void;
