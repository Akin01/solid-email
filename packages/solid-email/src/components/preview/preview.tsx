import { splitProps } from 'solid-js';
import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  styleObject,
} from '../shared';

export type PreviewProps = Readonly<
  IntrinsicProps<'div'> & {
    /** @default true */
    useTitleTag?: boolean;
    children: string | string[];
  }
>;

// Hidden preheader filler characters prevent mail clients from appending
// visible body text to previews.
const PREVIEW_MAX_LENGTH = 200;
export const PREVIEW_WHITE_SPACE_CODES =
  '\u00A0\u200C\u200B\u200D\u200E\u200F\uFEFF';
export function renderWhiteSpace(text: string) {
  return text.length >= PREVIEW_MAX_LENGTH ? null : (
    <div>
      {PREVIEW_WHITE_SPACE_CODES.repeat(PREVIEW_MAX_LENGTH - text.length)}
    </div>
  );
}

export function Preview(props: PreviewProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'style',
    'useTitleTag',
  ]);
  const text = (
    Array.isArray(local.children) ? local.children.join('') : local.children
  ).substring(0, PREVIEW_MAX_LENGTH);
  return (
    <>
      {local.useTitleTag === false ? null : <title>{text}</title>}
      <div
        {...rest}
        {...(cls(local) ? { class: cls(local) } : {})}
        style={normalizeStyle({
          display: 'none',
          overflow: 'hidden',
          'line-height': '1px',
          opacity: 0,
          'max-height': 0,
          'max-width': 0,
          ...styleObject(local.style),
        })}
        data-skip-in-text="true"
      >
        {text}
        {renderWhiteSpace(text)}
      </div>
    </>
  );
}
