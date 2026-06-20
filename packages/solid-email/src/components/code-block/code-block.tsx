import { type JSX, splitProps } from 'solid-js';
import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  type SolidStyle,
  styleObject,
  withoutClass,
} from '../shared';
import type { PrismLanguage } from './languages-available';
import { Prism } from './prism';
import type { Theme } from './themes';

type PrismToken = InstanceType<typeof Prism.Token>;

export interface CodeBlockProps extends IntrinsicProps<'pre'> {
  lineNumbers?: boolean;
  /**
   * Applies a font family to all elements rendered
   * in this component, mostly to override a global font from `<Font>`.
   */
  fontFamily?: string;
  theme: Theme;
  language: PrismLanguage;
  code: string;
}

const renderStyle = (style: SolidStyle | undefined) => {
  if (!style || Object.values(style).every((value) => value == null)) {
    return undefined;
  }
  return normalizeStyle(style);
};

const stylesForToken = (token: PrismToken, theme: Theme) => {
  let styles = { ...(theme[token.type] ?? {}) };

  const aliases = Array.isArray(token.alias) ? token.alias : [token.alias];

  for (const alias of aliases) {
    if (alias) styles = { ...styles, ...(theme[alias] ?? {}) };
  }

  return styles;
};

const CodeBlockLine = (props: {
  token: string | PrismToken;
  theme: Theme;
  inheritedStyles?: SolidStyle;
}): JSX.Element => {
  if (props.token instanceof Prism.Token) {
    const styleForToken = {
      ...props.inheritedStyles,
      ...stylesForToken(props.token, props.theme),
    };

    if (props.token.content instanceof Prism.Token) {
      return (
        <span style={renderStyle(styleForToken)}>
          <CodeBlockLine theme={props.theme} token={props.token.content} />
        </span>
      );
    }
    if (typeof props.token.content === 'string') {
      return (
        <span style={renderStyle(styleForToken)}>{props.token.content}</span>
      );
    }
    return (
      <>
        {props.token.content.map((subToken) => (
          <CodeBlockLine
            inheritedStyles={styleForToken}
            theme={props.theme}
            token={subToken}
          />
        ))}
      </>
    );
  }

  return (
    <span style={renderStyle(props.inheritedStyles)}>
      {props.token.replaceAll(' ', '\xA0\u200D\u200B')}
    </span>
  );
};

export function CodeBlock(props: Readonly<CodeBlockProps>) {
  const [local, rest] = splitProps(props, [
    'class',
    'className',
    'code',
    'fontFamily',
    'language',
    'lineNumbers',
    'style',
    'theme',
  ]);
  const languageGrammar = Prism.languages[local.language];
  if (typeof languageGrammar === 'undefined') {
    throw new Error(
      `CodeBlock: There is no language defined on Prism called ${local.language}`,
    );
  }

  const lines = local.code.split(/\r\n|\r|\n/gm);
  const tokensPerLine = lines.map((line) =>
    Prism.tokenize(line, languageGrammar),
  );

  return (
    <pre
      {...withoutClass(rest)}
      {...(cls(local) ? { class: cls(local) } : {})}
      style={renderStyle({
        ...(local.theme.base ?? {}),
        width: '100%',
        ...styleObject(local.style),
      })}
    >
      <code>
        {tokensPerLine.map((tokensForLine, lineIndex) => (
          <>
            {local.lineNumbers ? (
              <span
                style={renderStyle({
                  width: '2em',
                  height: '1em',
                  display: 'inline-block',
                  'font-family': local.fontFamily,
                })}
              >
                {lineIndex + 1}
              </span>
            ) : null}

            {tokensForLine.map((token) => (
              <CodeBlockLine
                inheritedStyles={{ 'font-family': local.fontFamily }}
                theme={local.theme}
                token={token}
              />
            ))}
            <br />
          </>
        ))}
      </code>
    </pre>
  );
}
