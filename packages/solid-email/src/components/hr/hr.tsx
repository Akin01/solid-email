import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  styleObject,
  withoutClass,
} from '../shared';
export type HrProps = Readonly<IntrinsicProps<'hr'>>;

export function Hr(props: HrProps) {
  return (
    <hr
      {...withoutClass(props)}
      {...(cls(props) ? { class: cls(props) } : {})}
      style={normalizeStyle({
        width: '100%',
        border: 'none',
        'border-color': 'transparent',
        'border-top': '1px solid #eaeaea',
        ...styleObject(props.style),
      })}
    />
  );
}
