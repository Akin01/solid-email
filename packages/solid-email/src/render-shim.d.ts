declare module '@solid-email/render' {
  import type {
    HtmlToTextOptions,
    SelectorDefinition,
  } from '@solid-email/html-to-text';
  import type { JSX } from '@solidjs/web';
  import type { Options as PrettierOptions } from 'prettier';

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

  export type CompileOptions = {
    withPlainText?: boolean;
    htmlToTextOptions?: HtmlToTextOptions;
  };

  export type CompileSyncOptions = CompileOptions;

  export type CompiledRenderOptions = {
    pretty?: boolean;
    plainText?: boolean;
  };

  export type CompiledRenderSyncOptions = {
    pretty?: false;
    plainText?: boolean;
  };
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
  export type SlotValue = SlotPrimitive | JSX.Element | SlotValue[];
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
    render(data: TSlots, options?: CompiledRenderOptions): Promise<string>;
    renderSync(data: TSlots, options?: CompiledRenderSyncOptions): string;
  }
  export function compile<TSlots extends SlotRecord = SlotRecord>(
    node: Renderable,
    options?: CompileOptions,
  ): Promise<CompiledTemplate<TSlots>>;
  export function compileSync<TSlots extends SlotRecord = SlotRecord>(
    node: Renderable,
    options?: CompileSyncOptions,
  ): CompiledTemplate<TSlots>;
}

declare module 'css-tree/dist/csstree.esm' {
  export * from 'css-tree';
}
