import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  styleObject,
  withoutClass,
} from '../shared';
export type ImgProps = Readonly<IntrinsicProps<'img'>>;

export function Img(props: ImgProps) {
  return (
    <img
      {...withoutClass(props)}
      {...(cls(props) ? { class: cls(props) } : {})}
      alt={props.alt ?? ''}
      style={normalizeStyle({
        display: 'block',
        outline: 'none',
        border: 'none',
        'text-decoration': 'none',
        ...styleObject(props.style),
      })}
    />
  );
}
