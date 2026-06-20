import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import {
  PREVIEW_WHITE_SPACE_CODES,
  Preview,
  renderWhiteSpace,
} from './preview';

describe('Preview', () => {
  it('renders hidden preheader, title, and filler by default', async () => {
    const html = await render(() => <Preview>Email preview text</Preview>);

    expect(html).toContain('<title>Email preview text</title>');
    expect(html).toContain('display:none');
    expect(html).toContain('overflow:hidden');
    expect(html).toContain('line-height:1px');
    expect(html).toContain('opacity:0');
    expect(html).toContain('max-height:0');
    expect(html).toContain('max-width:0');
    expect(html).toContain('data-skip-in-text="true"');
    expect(html).toContain('Email preview text');
    expect(html).toContain(PREVIEW_WHITE_SPACE_CODES);
  });

  it('concatenates array children and can omit the title tag', async () => {
    const html = await render(() => (
      <Preview useTitleTag={false}>{['Email ', 'preview ', 'text']}</Preview>
    ));

    expect(html).not.toContain('<title>');
    expect(html).toContain('Email preview text');
  });

  it('truncates long preview text at 200 characters without filler', async () => {
    const longText = 'really long'.repeat(30);
    const html = await render(() => <Preview>{longText}</Preview>);

    expect(html).toContain(`<title>${longText.substring(0, 200)}</title>`);
    expect(html).not.toContain(longText);
    expect(html).not.toContain(PREVIEW_WHITE_SPACE_CODES);
  });

  it('renders no whitespace filler when preview length reaches the limit', () => {
    expect(renderWhiteSpace('x'.repeat(200))).toBeNull();
  });

  it('renders whitespace filler for short preview text', async () => {
    const html = await render(() => renderWhiteSpace('Short text'));

    expect(html).toContain(
      PREVIEW_WHITE_SPACE_CODES.repeat(200 - 'Short text'.length),
    );
  });

  it('emits native class output from the Solid class prop', async () => {
    const html = await render(() => (
      <Preview class="preheader">Native class</Preview>
    ));

    expect(html).toMatch(/class="preheader\s*"/);
    expect(html).not.toContain('className');
  });

  it('normalizes class and styles while forwarding attrs without leaking internals', async () => {
    const html = await render(() => (
      <Preview
        className="preheader"
        data-testid="preview-test"
        style={{ display: 'block', maxHeight: 10 }}
        useTitleTag={false}
      >
        Visible preview
      </Preview>
    ));

    expect(html).toMatch(/class="preheader\s*"/);
    expect(html).toContain('data-testid="preview-test"');
    expect(html).toContain('display:block');
    expect(html).toContain('max-height:10px');
    expect(html).not.toContain('<title>');
    expect(html).not.toContain('className');
    expect(html).not.toContain('maxHeight');
    expect(html).not.toContain('useTitleTag');
  });
});
