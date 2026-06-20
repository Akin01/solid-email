import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  withoutClass,
} from '../shared';
export type HtmlProps = Readonly<IntrinsicProps<'html'>>;

export function Html(props: HtmlProps) {
  const classValue = cls(props);
  const style = normalizeStyle(props.style);
  return (
    <html
      {...withoutClass(props)}
      {...(classValue ? { class: classValue } : {})}
      dir={props.dir ?? 'ltr'}
      lang={props.lang ?? 'en'}
      {...(style ? { style } : {})}
    >
      {props.children}
    </html>
  );
}
