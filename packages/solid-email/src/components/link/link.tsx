import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  styleObject,
  withoutClass,
} from '../shared';
export type LinkProps = Readonly<IntrinsicProps<'a'>>;

export function Link(props: LinkProps) {
  return (
    <a
      {...withoutClass(props)}
      {...(cls(props) ? { class: cls(props) } : {})}
      target={props.target ?? '_blank'}
      style={normalizeStyle({
        color: '#067df7',
        'text-decoration-line': 'none',
        ...styleObject(props.style),
      })}
    >
      {props.children}
    </a>
  );
}
