import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Markdown } from './markdown';

const markdownFixtures = {
  defaults: `# Heading

This is **bold**.

- One
- Two

[Solid](https://solidjs.com)`,
  headings: `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`,
  customText:
    '**This is sample bold text in markdown** and *this is italic text*',
  customInlineStyles: '[Solid](https://solidjs.com)',
  looseList: `- item1

  paragraph continuation

- item2`,
  nestedList: `- parent list item
    - nested list item
- another parent item
    1. nested ordered item`,
  orderedStart: `3. Three
4. Four`,
  mediaBlocks: `![Logo](https://example.com/logo.png)

> Quote
> - Author

\`\`\`javascript
console.log("hi")
\`\`\``,
  quotedAttributes: `[Quoted](<https://example.com/"path"> "A \\"title\\"")

![Alt "Logo"](<https://example.com/"logo".png> "Image \\"Title\\"")`,
  table: `| Name | Count |
| :--- | ---: |
| Apples | 2 |`,
  plain: 'Plain',
  comprehensive: `Paragraph with \`inline code\`, ~~removed~~, and [Docs](https://solidjs.com "Docs \\"Title\\"").

Line with hard break  
next line

---

1. First
2. Second

![Logo](https://example.com/logo.png "Logo \\"Title\\"")`,
};

describe('Markdown', () => {
  it('renders markdown headings, emphasis, lists, and links with defaults', async () => {
    const html = await render(() => (
      <Markdown>{markdownFixtures.defaults}</Markdown>
    ));

    expect(html).toContain('<div data-id="_solid-email-markdown"');
    expect(html).toContain(
      '<h1 style="font-weight:500;padding-top:20px;font-size:2.5rem">Heading</h1>',
    );
    expect(html).toContain('<strong style="font-weight:bold">bold</strong>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>One</li>');
    expect(html).toContain(
      '<a href="https://solidjs.com" target="_blank" style="color:#007bff;text-decoration:underline;background-color:transparent">Solid</a>',
    );
  });

  it('renders all heading levels with default inline styles', async () => {
    const html = await render(() => (
      <Markdown>{markdownFixtures.headings}</Markdown>
    ));

    expect(html).toContain(
      '<h1 style="font-weight:500;padding-top:20px;font-size:2.5rem">Heading 1</h1>',
    );
    expect(html).toContain(
      '<h2 style="font-weight:500;padding-top:20px;font-size:2rem">Heading 2</h2>',
    );
    expect(html).toContain(
      '<h6 style="font-weight:500;padding-top:20px;font-size:1rem">Heading 6</h6>',
    );
  });

  it('renders custom text styles without breaking quoted CSS values', async () => {
    const html = await render(() => (
      <Markdown
        markdownCustomStyles={{
          bold: {
            font: '700 23px / 32px "Roobert PRO", system-ui, sans-serif',
            background: 'url("path/to/image")',
          },
        }}
      >
        {markdownFixtures.customText}
      </Markdown>
    ));

    expect(html).toContain(
      'font:700 23px / 32px &quot;Roobert PRO&quot;, system-ui, sans-serif',
    );
    expect(html).toContain('background:url(&quot;path/to/image&quot;)');
    expect(html).toContain(
      '<em style="font-style:italic">this is italic text</em>',
    );
    expect(html).not.toContain('&#x27;');
  });

  it('normalizes camelCase custom styles before serializing inline markup', async () => {
    const html = await render(() => (
      <Markdown
        markdownCustomStyles={{
          p: {
            backgroundColor: '#eee',
            fontSize: 18,
            lineHeight: 1.5,
          },
          link: {
            textDecoration: 'none',
          },
        }}
      >
        {markdownFixtures.customInlineStyles}
      </Markdown>
    ));

    expect(html).toContain(
      '<p style="background-color:#eee;font-size:18px;line-height:1.5">',
    );
    expect(html).toContain('style="text-decoration:none">Solid</a>');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('fontSize');
    expect(html).not.toContain('textDecoration');
  });

  it('renders loose, nested, and non-default-start lists', async () => {
    const loose = await render(() => (
      <Markdown>{markdownFixtures.looseList}</Markdown>
    ));
    const nested = await render(() => (
      <Markdown>{markdownFixtures.nestedList}</Markdown>
    ));
    const started = await render(() => (
      <Markdown>{markdownFixtures.orderedStart}</Markdown>
    ));

    expect(loose).toContain('<p>paragraph continuation</p>');
    expect(nested).toContain('<ul>');
    expect(nested).toContain('<ol>');
    expect(nested).toContain('<li>nested ordered item</li>');
    expect(started).toContain('<ol start="3">');
    expect(started).toContain('<li>Three</li>');
  });

  it('renders images, blockquotes, and code blocks with email-safe markup', async () => {
    const html = await render(() => (
      <Markdown>{markdownFixtures.mediaBlocks}</Markdown>
    ));

    expect(html).toContain(
      '<img src="https://example.com/logo.png" alt="Logo">',
    );
    expect(html).toContain('<blockquote style="background:#f9f9f9');
    expect(html).toContain('<li>Author</li>');
    expect(html).toContain('<pre style="');
    expect(html).toContain('<code>console.log("hi")');
  });

  it('escapes quotes in link and image attributes', async () => {
    const html = await render(() => (
      <Markdown>{markdownFixtures.quotedAttributes}</Markdown>
    ));

    expect(html).toContain(
      '<a href="https://example.com/&quot;path&quot;" target="_blank" title="A &quot;title&quot;"',
    );
    expect(html).toContain(
      '<img src="https://example.com/&quot;logo&quot;.png" alt="Alt &quot;Logo&quot;" title="Image &quot;Title&quot;">',
    );
    expect(html).not.toContain('href="https://example.com/"path""');
    expect(html).not.toContain('title="A "title""');
  });

  it('renders table structure and custom table styles', async () => {
    const html = await render(() => (
      <Markdown
        markdownCustomStyles={{
          table: { borderCollapse: 'collapse' },
          thead: { backgroundColor: '#fafafa' },
          tbody: { color: '#111' },
          tr: { borderBottom: '1px solid #ddd' },
          th: { fontWeight: 600 },
          td: { paddingTop: 4 },
        }}
      >
        {markdownFixtures.table}
      </Markdown>
    ));

    expect(html).toContain(
      '<table role="presentation" style="border-collapse:collapse">',
    );
    expect(html).toContain('<thead style="background-color:#fafafa">');
    expect(html).toContain('<tbody style="color:#111">');
    expect(html).toContain('<tr style="border-bottom:1px solid #ddd">');
    expect(html).toContain(
      '<th align="left" style="font-weight:600">Name</th>',
    );
    expect(html).toContain('<td align="right" style="padding-top:4px">2</td>');
    expect(html).not.toContain('borderCollapse');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('paddingTop');
  });

  it('normalizes container styles and forwards native container attrs', async () => {
    const html = await render(() => (
      <Markdown
        className="markdown-copy"
        data-testid="markdown-container"
        dir="ltr"
        markdownContainerStyles={{ backgroundColor: '#fff', fontSize: 16 }}
        markdownCustomStyles={{ p: { color: '#111' } }}
      >
        {markdownFixtures.plain}
      </Markdown>
    ));

    expect(html).toMatch(/class="markdown-copy\s*"/);
    expect(html).toContain('data-testid="markdown-container"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('background-color:#fff');
    expect(html).toContain('font-size:16px');
    expect(html).toContain('<p style="color:#111">Plain</p>');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('fontSize');
    expect(html).not.toContain('markdownContainerStyles');
    expect(html).not.toContain('markdownCustomStyles');
  });

  it('renders inline code, strikethrough, hard breaks, rules, lists, links, and titled images', async () => {
    const html = await render(() => (
      <Markdown
        markdownCustomStyles={{
          codeInline: { backgroundColor: '#eee', fontSize: 13 },
          strikethrough: { color: '#999', textDecoration: 'line-through' },
          br: { display: 'block' },
          hr: { borderTop: '2px solid #ddd' },
          ol: { paddingLeft: 24 },
          li: { marginBottom: 4 },
          image: { maxWidth: '100%' },
          link: { textDecoration: 'none' },
        }}
      >
        {markdownFixtures.comprehensive}
      </Markdown>
    ));

    expect(html).toContain(
      '<code style="background-color:#eee;font-size:13px">inline code</code>',
    );
    expect(html).toContain(
      '<del style="color:#999;text-decoration:line-through">removed</del>',
    );
    expect(html).toContain('<br style="display:block" />');
    expect(html).toContain('<hr style="border-top:2px solid #ddd" />');
    expect(html).toContain('<ol style="padding-left:24px">');
    expect(html).toContain('<li style="margin-bottom:4px">First</li>');
    expect(html).toContain(
      '<a href="https://solidjs.com" target="_blank" title="Docs &quot;Title&quot;" style="text-decoration:none">Docs</a>',
    );
    expect(html).toContain(
      '<img src="https://example.com/logo.png" alt="Logo" title="Logo &quot;Title&quot;" style="max-width:100%">',
    );
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('fontSize');
    expect(html).not.toContain('textDecoration');
    expect(html).not.toContain('borderTop');
    expect(html).not.toContain('paddingLeft');
    expect(html).not.toContain('marginBottom');
    expect(html).not.toContain('maxWidth');
  });
});
