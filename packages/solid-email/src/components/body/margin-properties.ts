import type { JSX } from 'solid-js';

type CssProperty = keyof JSX.CSSProperties;

export const marginProperties = [
  'margin',
  'margin-top',
  'margin-bottom',
  'margin-right',
  'margin-left',
  'margin-inline',
  'margin-block',
  'margin-block-start',
  'margin-block-end',
  'margin-inline-start',
  'margin-inline-end',
] as const satisfies readonly CssProperty[];

export const paddingProperties = [
  'padding',
  'padding-top',
  'padding-bottom',
  'padding-right',
  'padding-left',
  'padding-inline',
  'padding-block',
  'padding-block-start',
  'padding-block-end',
  'padding-inline-start',
  'padding-inline-end',
] as const satisfies readonly CssProperty[];
