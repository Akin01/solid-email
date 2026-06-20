import type { SolidStyle } from '../shared';

const emptyStyle = {};

const baseHeaderStyles = {
  'font-weight': '500',
  'padding-top': 20,
};

const h1 = {
  ...baseHeaderStyles,
  'font-size': '2.5rem',
};

const h2 = {
  ...baseHeaderStyles,
  'font-size': '2rem',
};
const h3 = {
  ...baseHeaderStyles,
  'font-size': '1.75rem',
};
const h4 = {
  ...baseHeaderStyles,
  'font-size': '1.5rem',
};
const h5 = {
  ...baseHeaderStyles,
  'font-size': '1.25rem',
};
const h6 = {
  ...baseHeaderStyles,
  'font-size': '1rem',
};

const bold = {
  'font-weight': 'bold',
};

const italic = {
  'font-style': 'italic',
};

const blockQuote = {
  background: '#f9f9f9',
  'border-left': '10px solid #ccc',
  margin: '1.5em 10px',
  padding: '1em 10px',
};

const codeInline = {
  color: '#212529',
  'font-size': '87.5%',
  display: 'inline',
  background: ' #f8f8f8',
  'font-family': 'SFMono-Regular,Menlo,Monaco,Consolas,monospace',
};

const codeBlock = {
  ...codeInline,
  display: 'block',
  'padding-top': 10,
  'padding-right': 10,
  'padding-left': 10,
  'padding-bottom': 1,
  'margin-bottom': 20,
  background: ' #f8f8f8',
};

const link = {
  color: '#007bff',
  'text-decoration': 'underline',
  'background-color': 'transparent',
};

export type StylesType = {
  h1?: SolidStyle;
  h2?: SolidStyle;
  h3?: SolidStyle;
  h4?: SolidStyle;
  h5?: SolidStyle;
  h6?: SolidStyle;
  blockQuote?: SolidStyle;
  bold?: SolidStyle;
  italic?: SolidStyle;
  link?: SolidStyle;
  codeBlock?: SolidStyle;
  codeInline?: SolidStyle;
  p?: SolidStyle;
  li?: SolidStyle;
  ul?: SolidStyle;
  ol?: SolidStyle;
  image?: SolidStyle;
  br?: SolidStyle;
  hr?: SolidStyle;
  table?: SolidStyle;
  thead?: SolidStyle;
  tbody?: SolidStyle;
  tr?: SolidStyle;
  th?: SolidStyle;
  td?: SolidStyle;
  strikethrough?: SolidStyle;
};

export const styles: StylesType = {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  blockQuote,
  bold,
  italic,
  link,
  codeBlock: { ...codeBlock, 'word-wrap': 'break-word' },
  codeInline: { ...codeInline, 'word-wrap': 'break-word' },
  p: emptyStyle,
  li: emptyStyle,
  ul: emptyStyle,
  ol: emptyStyle,
  image: emptyStyle,
  br: emptyStyle,
  hr: emptyStyle,
  table: emptyStyle,
  thead: emptyStyle,
  tbody: emptyStyle,
  th: emptyStyle,
  td: emptyStyle,
  tr: emptyStyle,
  strikethrough: emptyStyle,
};
