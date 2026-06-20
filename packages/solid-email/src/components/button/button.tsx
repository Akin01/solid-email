import { splitProps } from 'solid-js';
import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  styleObject,
  withoutClass,
} from '../shared';
import { parsePadding } from './utils/parse-padding';
import { pxToPt } from './utils/px-to-pt';

const maxFontWidth = 5;

/**
 * Outlook note: computes a `mso-font-width` <= 5 and a count of
 * space characters that together approximate the expected padding width.
 */
function computeFontWidthAndSpaceCount(expectedWidth: number) {
  if (expectedWidth === 0) return [0, 0] as const;

  let smallestSpaceCount = 0;
  const computeRequiredFontWidth = () =>
    smallestSpaceCount > 0
      ? expectedWidth / smallestSpaceCount / 2
      : Number.POSITIVE_INFINITY;

  while (computeRequiredFontWidth() > maxFontWidth) {
    smallestSpaceCount++;
  }

  return [computeRequiredFontWidth(), smallestSpaceCount] as const;
}

const px = (value: number | undefined) =>
  value === undefined ? undefined : `${value}px`;

export type ButtonProps = Readonly<IntrinsicProps<'a'>>;

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'style',
    'target',
  ]);
  const style = styleObject(local.style);
  const {
    'padding-top': paddingTop,
    'padding-right': paddingRight,
    'padding-bottom': paddingBottom,
    'padding-left': paddingLeft,
  } = parsePadding(style);
  const textRaise = pxToPt((paddingTop ?? 0) + (paddingBottom ?? 0));
  const [plFontWidth, plSpaceCount] = computeFontWidthAndSpaceCount(
    paddingLeft ?? 0,
  );
  const [prFontWidth, prSpaceCount] = computeFontWidthAndSpaceCount(
    paddingRight ?? 0,
  );
  return (
    <a
      {...withoutClass(rest)}
      class={cls(local)}
      target={local.target ?? '_blank'}
      style={normalizeStyle({
        'line-height': '100%',
        'text-decoration': 'none',
        display: 'inline-block',
        'max-width': '100%',
        'mso-padding-alt': '0px',
        ...style,
        'padding-top': px(paddingTop),
        'padding-right': px(paddingRight),
        'padding-bottom': px(paddingBottom),
        'padding-left': px(paddingLeft),
      })}
    >
      <span
        // The `&#8202;` is as close to `1px` of an empty character as we can get, then, we use the `mso-font-width`
        // to scale it according to what padding the developer wants. `mso-font-width` also does not allow for percentages
        // >= 500% so we need to add extra spaces accordingly.
        //
        // See https://github.com/resend/react-email/issues/1512 for why we do not use letter-spacing instead.
        innerHTML={`<!--[if mso]><i style="mso-font-width:${
          plFontWidth * 100
        }%;mso-text-raise:${textRaise}" hidden>${'&#8202;'.repeat(
          plSpaceCount,
        )}</i><![endif]-->`}
      />
      <span
        style={normalizeStyle({
          'max-width': '100%',
          display: 'inline-block',
          'line-height': '120%',
          'mso-padding-alt': '0px',
          'mso-text-raise':
            paddingBottom === undefined
              ? undefined
              : `${pxToPt(paddingBottom)}px`,
        })}
      >
        {local.children}
      </span>
      <span
        innerHTML={`<!--[if mso]><i style="mso-font-width:${
          prFontWidth * 100
        }%" hidden>${'&#8202;'.repeat(prSpaceCount)}&#8203;</i><![endif]-->`}
      />
    </a>
  );
}
