import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  splitPadding,
  withoutClass,
} from '../shared';

export type SectionProps = Readonly<IntrinsicProps<'table'>>;

export function Section(props: SectionProps) {
  // Split padding styles to improve compatibility with Klaviyo and Outlook
  // while preserving user-provided style order.
  const { tableStyle, tdStyle } = splitPadding(props.style);
  const tableHtmlStyle = normalizeStyle(tableStyle ?? null);
  const tdHtmlStyle = normalizeStyle(tdStyle);
  const classValue = cls(props);
  return (
    <table
      align="center"
      width="100%"
      border={0}
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      {...withoutClass(props)}
      {...(classValue ? { class: classValue } : {})}
      {...(tableHtmlStyle ? { style: tableHtmlStyle } : {})}
    >
      <tbody>
        <tr>
          <td {...(tdHtmlStyle ? { style: tdHtmlStyle } : {})}>
            {props.children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
