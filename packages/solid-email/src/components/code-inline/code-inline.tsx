import { splitProps } from 'solid-js';
import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  styleObject,
  withoutClass,
} from '../shared';
/**
 * If users receive emails in Orange.fr, this component only works when the
 * email has a head containing meta tags.
 */
export type CodeInlineProps = Readonly<
  IntrinsicProps<'code'> & IntrinsicProps<'span'>
>;
export function CodeInline(props: CodeInlineProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'ref',
    'style',
  ]);
  const classValue = cls(local);
  const style = normalizeStyle(local.style);
  return (
    <>
      {/*
        This style targets Orange.fr. That client removes head/html, making
        meta a sibling of the rendered code nodes, and supports style tags.

        See:
        - https://www.caniemail.com/features/html-code/
        - https://www.howtotarget.email/#2019-03-26-freenet-2
      */}
      <style>{`meta ~ .cino{display:none!important;opacity:0!important}meta ~ .cio{display:block!important}`}</style>
      {/* Does not render on Orange.fr. */}
      <code
        {...withoutClass(rest)}
        class={classValue ? `${classValue} cino` : 'cino'}
        {...(style ? { style } : {})}
      >
        {local.children}
      </code>
      {/* Renders only on Orange.fr. */}
      <span
        {...withoutClass(rest)}
        class={classValue ? `${classValue} cio` : 'cio'}
        ref={
          local.ref as
            | HTMLSpanElement
            | ((element: HTMLSpanElement) => void)
            | undefined
        }
        style={normalizeStyle({
          display: 'none',
          ...styleObject(local.style),
        })}
      >
        {local.children}
      </span>
    </>
  );
}
