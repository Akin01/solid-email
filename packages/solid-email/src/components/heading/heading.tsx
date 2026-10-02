import { dynamic } from '@solidjs/web';
import { omit } from 'solid-js';
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
  const rest = omit(
    props,
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
  );
  const Tag = dynamic(() => props.as ?? 'h1');
  return (
    <Tag
      {...withoutClass(rest)}
      class={cls(props)}
      style={normalizeStyle({
        ...withMargin(props),
        ...styleObject(props.style),
      })}
    >
      {props.children}
    </Tag>
  );
}
