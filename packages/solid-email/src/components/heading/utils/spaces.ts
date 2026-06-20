import type { SolidStyle } from '../../shared';
export type Margin = {
  m?: string | number;
  mx?: string | number;
  my?: string | number;
  mt?: string | number;
  mr?: string | number;
  mb?: string | number;
  ml?: string | number;
};
export function withSpace(value: string | number | undefined) {
  if (value === undefined) return undefined;
  if (Number.isNaN(Number.parseFloat(String(value)))) return undefined;
  return `${value}px`;
}

export function withMargin(input: Margin) {
  const style: SolidStyle = {};
  const set = (key: string, value: string | number | undefined) => {
    const space = withSpace(value);
    if (space !== undefined) style[key] = space;
  };
  set('margin', input.m);
  set('margin-left', input.mx);
  set('margin-right', input.mx);
  set('margin-top', input.my);
  set('margin-bottom', input.my);
  set('margin-top', input.mt);
  set('margin-right', input.mr);
  set('margin-bottom', input.mb);
  set('margin-left', input.ml);
  return style;
}
