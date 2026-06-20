import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Font } from './font';

describe('Font', () => {
  it('renders @font-face CSS with fallback and defaults', async () => {
    const html = await render(() => (
      <Font fontFamily="Inter" fallbackFontFamily="Arial" />
    ));

    expect(html).toContain('<style>');
    expect(html).toContain("font-family: 'Inter'");
    expect(html).toContain('font-style: normal');
    expect(html).toContain('font-weight: 400');
    expect(html).toContain("mso-font-alt: 'Arial'");
    expect(html).toContain("* { font-family: 'Inter', Arial; }");
  });

  it('renders web font source and ordered fallback array', async () => {
    const html = await render(() => (
      <Font
        fontFamily="Roboto"
        fallbackFontFamily={['Helvetica', 'Arial']}
        webFont={{ url: 'https://example.com/roboto.woff2', format: 'woff2' }}
        fontWeight={700}
        fontStyle="italic"
      />
    ));

    expect(html).toContain(
      "src: url(https://example.com/roboto.woff2) format('woff2');",
    );
    expect(html).toContain('font-style: italic');
    expect(html).toContain('font-weight: 700');
    expect(html).toContain("mso-font-alt: 'Helvetica'");
    expect(html).toContain("* { font-family: 'Roboto', Helvetica, Arial; }");
  });

  it('omits web font src when no webFont is provided', async () => {
    const html = await render(() => (
      <Font fontFamily="System" fallbackFontFamily={['Arial', 'sans-serif']} />
    ));

    expect(html).toContain("@font-face { font-family: 'System'");
    expect(html).toContain("mso-font-alt: 'Arial'");
    expect(html).toContain("* { font-family: 'System', Arial, sans-serif; }");
    expect(html).not.toContain('src: url(');
  });
});
