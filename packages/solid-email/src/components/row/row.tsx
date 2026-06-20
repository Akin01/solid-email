import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  withoutClass,
} from '../shared';

export type RowProps = Readonly<IntrinsicProps<'table'>>;

export function Row(props: RowProps) {
  const classValue = cls(props);
  const style = normalizeStyle(props.style);
  return (
    <table
      attr:align="center"
      attr:width="100%"
      attr:border={0}
      attr:cellpadding="0"
      attr:cellspacing="0"
      role="presentation"
      {...withoutClass(props)}
      {...(classValue ? { class: classValue } : {})}
      {...(style ? { style } : {})}
    >
      <tbody style={{ width: '100%' }}>
        <tr style={{ width: '100%' }}>{props.children}</tr>
      </tbody>
    </table>
  );
}
