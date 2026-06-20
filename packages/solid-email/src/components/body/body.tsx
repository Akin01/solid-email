import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  type SolidStyle,
  styleObject,
  styleStringObject,
  withoutClass,
} from '../shared';
import { marginProperties, paddingProperties } from './margin-properties';

export type BodyProps = Readonly<IntrinsicProps<'body'>>;

const bodyResetProperties: Record<string, true> = Object.fromEntries(
  [...marginProperties, ...paddingProperties].map((property) => [
    property,
    true,
  ]),
) as Record<string, true>;

export function Body(props: BodyProps) {
  const style =
    typeof props.style === 'string'
      ? styleStringObject(props.style)
      : styleObject(props.style);
  const bodyStyle: SolidStyle = {};
  for (const key in style) {
    const value = style[key];
    if (key === 'background' || key === 'background-color') {
      bodyStyle[key] = value;
    } else if (bodyResetProperties[key] && value !== undefined) {
      bodyStyle[key] = 0;
    }
  }
  const bodyClass = cls(props);
  const bodyHtmlStyle = normalizeStyle(bodyStyle);
  const cellHtmlStyle = normalizeStyle(props.style);
  return (
    <body
      {...withoutClass(props)}
      {...(bodyClass ? { class: bodyClass } : {})}
      dir={props.dir ?? 'ltr'}
      lang={props.lang ?? 'en'}
      {...(bodyHtmlStyle ? { style: bodyHtmlStyle } : {})}
    >
      <table
        attr:border={0}
        attr:width="100%"
        attr:cellpadding="0"
        attr:cellspacing="0"
        role="presentation"
        attr:align="center"
      >
        <tbody>
          <tr>
            {/*
              Yahoo and AOL remove all styles of the body element while
              converting it to a div, so body styles are also applied to this
              inner cell.
            */}
            <td
              dir={props.dir ?? 'ltr'}
              lang={props.lang ?? 'en'}
              {...(cellHtmlStyle ? { style: cellHtmlStyle } : {})}
            >
              {props.children}
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  );
}
