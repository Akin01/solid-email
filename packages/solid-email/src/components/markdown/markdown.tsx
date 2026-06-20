import { marked, Renderer } from 'marked';
import { splitProps } from 'solid-js';
import {
  cls,
  type IntrinsicProps,
  normalizeStyle,
  type SolidStyle,
  type StyleInput,
  withoutClass,
} from '../shared';
import { type StylesType, styles } from './styles';
import { parseCssInJsToInlineCss } from './utils/parse-css-in-js-to-inline-css';

export type MarkdownProps = Readonly<
  IntrinsicProps<'div'> & {
    children: string;
    markdownCustomStyles?: StylesType;
    markdownContainerStyles?: StyleInput;
  }
>;

const styleAttr = (style: SolidStyle | undefined) => {
  const inline = parseCssInJsToInlineCss(style);
  return inline !== '' ? ` style="${inline}"` : '';
};

const escapeHtmlAttribute = (value: string) => value.replaceAll('"', '&quot;');

export function Markdown(props: MarkdownProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'markdownCustomStyles',
    'markdownContainerStyles',
  ]);
  const finalStyles = { ...styles, ...local.markdownCustomStyles };
  const renderer = new Renderer();

  renderer.blockquote = ({ tokens }) => {
    const text = renderer.parser.parse(tokens);
    return `<blockquote${styleAttr(finalStyles.blockQuote)}>\n${text}</blockquote>\n`;
  };

  renderer.br = () => `<br${styleAttr(finalStyles.br)} />`;

  renderer.code = ({ text }) => {
    text = `${text.replace(/\n$/, '')}\n`;
    return `<pre${styleAttr(finalStyles.codeBlock)}><code>${text}</code></pre>\n`;
  };

  renderer.codespan = ({ text }) =>
    `<code${styleAttr(finalStyles.codeInline)}>${text}</code>`;

  renderer.del = ({ tokens }) => {
    const text = renderer.parser.parseInline(tokens);
    return `<del${styleAttr(finalStyles.strikethrough)}>${text}</del>`;
  };

  renderer.em = ({ tokens }) => {
    const text = renderer.parser.parseInline(tokens);
    return `<em${styleAttr(finalStyles.italic)}>${text}</em>`;
  };

  renderer.heading = ({ tokens, depth }) => {
    const text = renderer.parser.parseInline(tokens);
    return `<h${depth}${styleAttr(
      finalStyles[`h${depth}` as keyof StylesType],
    )}>${text}</h${depth}>`;
  };

  renderer.hr = () => `<hr${styleAttr(finalStyles.hr)} />\n`;

  renderer.image = ({ href, text, title }) =>
    `<img src="${escapeHtmlAttribute(href)}" alt="${escapeHtmlAttribute(text)}"${
      title ? ` title="${escapeHtmlAttribute(title)}"` : ''
    }${styleAttr(finalStyles.image)}>`;

  renderer.link = ({ href, title, tokens }) => {
    const text = renderer.parser.parseInline(tokens);
    return `<a href="${escapeHtmlAttribute(href)}" target="_blank"${
      title ? ` title="${escapeHtmlAttribute(title)}"` : ''
    }${styleAttr(finalStyles.link)}>${text}</a>`;
  };

  renderer.listitem = ({ tokens, loose }) => {
    const hasNestedList = tokens.some((token) => token.type === 'list');
    const text =
      loose || hasNestedList
        ? renderer.parser.parse(tokens)
        : renderer.parser.parseInline(tokens);
    return `<li${styleAttr(finalStyles.li)}>${text}</li>\n`;
  };

  renderer.list = ({ items, ordered, start }) => {
    const type = ordered ? 'ol' : 'ul';
    const startAt = ordered && start !== 1 ? ` start="${start}"` : '';
    const styles = styleAttr(finalStyles[ordered ? 'ol' : 'ul']);
    return `<${type}${startAt}${styles}>\n${items
      .map((item) => renderer.listitem(item))
      .join('')}</${type}>\n`;
  };

  renderer.paragraph = ({ tokens }) => {
    const text = renderer.parser.parseInline(tokens);
    return `<p${styleAttr(finalStyles.p)}>${text}</p>\n`;
  };

  renderer.strong = ({ tokens }) => {
    const text = renderer.parser.parseInline(tokens);
    return `<strong${styleAttr(finalStyles.bold)}>${text}</strong>`;
  };

  renderer.table = ({ header, rows }) => {
    const tableStyle = styleAttr(finalStyles.table);
    const theadStyle = styleAttr(finalStyles.thead);
    const tbodyStyle = styleAttr(finalStyles.tbody);
    const theadRow = renderer.tablerow({
      text: header.map((cell) => renderer.tablecell(cell)).join(''),
    });
    const tbodyRows = rows
      .map((row) =>
        renderer.tablerow({
          text: row.map((cell) => renderer.tablecell(cell)).join(''),
        }),
      )
      .join('');
    return `<table role="presentation"${tableStyle}>\n<thead${theadStyle}>\n${theadRow}</thead>\n<tbody${tbodyStyle}>${tbodyRows}</tbody></table>\n`;
  };

  renderer.tablecell = ({ tokens, align, header }) => {
    const text = renderer.parser.parseInline(tokens);
    const type = header ? 'th' : 'td';
    const alignAttr = align ? ` align="${align}"` : '';
    return `<${type}${alignAttr}${styleAttr(finalStyles[type])}>${text}</${type}>\n`;
  };

  renderer.tablerow = ({ text }) =>
    `<tr${styleAttr(finalStyles.tr)}>\n${text}</tr>\n`;

  const html = marked.parse(local.children, {
    renderer,
    async: false,
  }) as string;

  return (
    <div
      {...withoutClass(rest)}
      data-id="_solid-email-markdown"
      class={cls(props)}
      innerHTML={html}
      style={normalizeStyle(local.markdownContainerStyles)}
    />
  );
}
