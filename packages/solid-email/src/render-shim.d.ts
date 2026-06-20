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
}
