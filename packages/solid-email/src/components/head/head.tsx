import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  withoutClass,
} from '../shared';
export type HeadProps = Readonly<IntrinsicProps<'head'>>;

export function Head(props: HeadProps) {
  const classValue = cls(props);
  const style = normalizeStyle(props.style);
  return (
    <head
      {...withoutClass(props)}
      {...(classValue ? { class: classValue } : {})}
      {...(style ? { style } : {})}
    >
      <meta content="text/html; charset=UTF-8" http-equiv="content-type" />
      <meta name="x-apple-disable-message-reformatting" />
      {props.children}
    </head>
  );
}
