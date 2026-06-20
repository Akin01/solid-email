import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Html } from './html';

describe('Html', () => {
  it('renders email-compatible defaults', async () => {
    const html = await render(() => <Html />);

    expect(html).toContain('<html');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('lang="en"');
  });

  it('allows dir, lang, class, and data attributes', async () => {
    const html = await render(() => (
      <Html data-testid="html-test" dir="rtl" lang="fr" class="root" />
    ));

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="fr"');
    expect(html).toMatch(/class="root\s*"/);
    expect(html).toContain('data-testid="html-test"');
    expect(html).not.toContain('className');
  });

  it('normalizes className and camel-case styles without leaking compatibility props', async () => {
    const html = await render(() => (
      <Html
        data-shell="root"
        className="compat-root"
        style={{ backgroundColor: 'white' }}
      >
        <span>Hi</span>
      </Html>
    ));

    expect(html).toMatch(/class="compat-root\s*"/);
    expect(html).toContain('style="background-color:white"');
    expect(html).toContain('data-shell="root"');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
  });

  it('prefers Solid class over compatibility className', async () => {
    const html = await render(() => (
      <Html class="solid-root" className="compat-root" />
    ));

    expect(html).toMatch(/class="solid-root\s*"/);
    expect(html).not.toContain('compat-root');
    expect(html).not.toContain('className');
  });
});
