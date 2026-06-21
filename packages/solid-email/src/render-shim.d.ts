declare module '@solid-email/render' {
  import type { HtmlToTextOptions, SelectorDefinition } from 'html-to-text';
  import type { Options as PrettierOptions } from 'prettier';
  import type { JSX } from 'solid-js';

  export type Renderable = JSX.Element | (() => JSX.Element);
  export type Options = {
    pretty?: boolean;
  } & (
    | { plainText?: false }
    | { plainText?: true; htmlToTextOptions?: HtmlToTextOptions }
  );

  export type RenderSyncOptions = {
    pretty?: false;
  } & (
    | { plainText?: false }
    | { plainText?: true; htmlToTextOptions?: HtmlToTextOptions }
  );
  export const plainTextSelectors: SelectorDefinition[];
  export function toPlainText(
    html: string,
    options?: HtmlToTextOptions,
  ): string;
  export function pretty(
    str: string,
    options?: PrettierOptions,
  ): Promise<string>;
  export function render(node: Renderable, options?: Options): Promise<string>;
  export function renderSync(
    node: Renderable,
    options?: RenderSyncOptions,
  ): string;

  export type SlotPrimitive = string | number | boolean | null | undefined;
  export type SlotValue = SlotPrimitive | SlotValue[];
  export type SlotRecord = Record<string, SlotValue>;
  export interface SlotOccurrence {
    full: string;
    hasDefault: boolean;
    defaultValue: string;
  }
  export function Slot(props: {
    name: string;
    children?: JSX.Element;
  }): JSX.Element;
  export function slot(name: string): string;
  export interface SlotDefinition<T extends SlotRecord> {
    content: <K extends keyof T & string>(
      name: K,
      defaultValue?: string,
    ) => string;
    attr: <K extends keyof T & string>(name: K) => string;
  }
  export function defineSlots<T extends SlotRecord>(): SlotDefinition<T>;
  export class CompiledTemplate<TSlots extends SlotRecord = SlotRecord> {
    render(data: TSlots, options?: Options): Promise<string>;
    renderSync(data: TSlots, options?: RenderSyncOptions): string;
  }
  export function compile<TSlots extends SlotRecord = SlotRecord>(
    node: Renderable,
    options?: Options,
  ): Promise<CompiledTemplate<TSlots>>;
  export function compileSync<TSlots extends SlotRecord = SlotRecord>(
    node: Renderable,
    options?: RenderSyncOptions,
  ): CompiledTemplate<TSlots>;
}
