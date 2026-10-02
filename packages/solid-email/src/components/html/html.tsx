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
      lang={props.lang ?? 'en'}
      dir={props.dir ?? 'ltr'}
      {...(style ? { style } : {})}
    >
      {props.children}
    </html>
  );
}
