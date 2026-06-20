import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  styleObject,
  withoutClass,
} from '../shared';
import type { As } from './utils/as';
import type { Margin } from './utils/spaces';
import { withMargin } from './utils/spaces';
export type HeadingAs = As<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
export type HeadingProps = Readonly<IntrinsicProps<'h1'> & HeadingAs & Margin>;

export function Heading(props: HeadingProps) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'style',
    'm',
    'mx',
    'my',
    'mt',
    'mr',
    'mb',
    'ml',
    'class',
    'className',
  ]);
  return (
    <Dynamic
      component={local.as ?? 'h1'}
      {...withoutClass(rest)}
      class={cls(local)}
      style={normalizeStyle({
        ...withMargin(local),
        ...styleObject(local.style),
      })}
    >
      {local.children}
    </Dynamic>
  );
}
