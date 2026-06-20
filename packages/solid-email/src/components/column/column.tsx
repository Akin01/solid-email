import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  withoutClass,
} from '../shared';
export type ColumnProps = Readonly<IntrinsicProps<'td'>>;

export function Column(props: ColumnProps) {
  const classValue = cls(props);
  const style = normalizeStyle(props.style);
  return (
    <td
      {...withoutClass(props)}
      {...(classValue ? { class: classValue } : {})}
      {...(style ? { style } : {})}
      data-id="_solid-email-column"
    >
      {props.children}
    </td>
  );
}
