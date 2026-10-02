import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  splitPadding,
  withoutClass,
} from '../shared';
export type ContainerProps = Readonly<IntrinsicProps<'table'>>;

export function Container(props: ContainerProps) {
  // Split padding styles to improve compatibility with Klaviyo and Outlook
  // while preserving user-provided style order.
  const { tableStyle, tdStyle } = splitPadding(props.style);
  const tableHtmlStyle = normalizeStyle({
    'max-width': '37.5em',
    ...tableStyle,
  });
  const tdHtmlStyle = normalizeStyle(tdStyle);
  const classValue = cls(props);
  return (
    <table
      align="center"
      width="100%"
      {...withoutClass(props)}
      {...(classValue ? { class: classValue } : {})}
      border={0}
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style={tableHtmlStyle}
    >
      <tbody>
        <tr style={{ width: '100%' }}>
          <td {...(tdHtmlStyle ? { style: tdHtmlStyle } : {})}>
            {props.children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
