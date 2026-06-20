import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  type SolidStyle,
  styleObject,
  withoutClass,
} from '../shared';
import { computeMargins } from './utils/compute-margins';

export type TextProps = Readonly<IntrinsicProps<'p'>>;

export function Text(props: TextProps) {
  const style = styleObject(props.style);
  const defaultMargins: SolidStyle = {};
  if (style['margin-top'] === undefined) defaultMargins['margin-top'] = '16px';
  if (style['margin-bottom'] === undefined)
    defaultMargins['margin-bottom'] = '16px';
  const margins = computeMargins({ ...defaultMargins, ...style });
  const textStyle: SolidStyle = {
    'font-size': '14px',
    'line-height': '24px',
    ...style,
    ...margins,
  };
  return (
    <p
      {...withoutClass(props)}
      {...(cls(props) ? { class: cls(props) } : {})}
      style={normalizeStyle(textStyle)}
    >
      {props.children}
    </p>
  );
}
