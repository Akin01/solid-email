import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { CodeInline } from './code-inline';

describe('CodeInline', () => {
  it('renders Orange.fr fallback markup', async () => {
    const html = await render(() => <CodeInline>const x = 1;</CodeInline>);

    expect(html).toContain('meta ~ .cino');
    expect(html).toContain('meta ~ .cio');
    expect(html).toMatch(/<code class="cino\s*">const x = 1;<\/code>/);
    expect(html).toMatch(
      /<span class="cio\s*" style="display:none">const x = 1;<\/span>/,
    );
  });

  it('applies class and style handling to both visible variants', async () => {
    const html = await render(() => (
      <CodeInline class="token" style={{ 'background-color': '#eee' }}>
        code
      </CodeInline>
    ));

    expect(html).toMatch(/class="token cino\s*"/);
    expect(html).toMatch(/class="token cio\s*"/);
    expect(html).toContain('background-color:#eee');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('className');
  });

  it('normalizes alternate class and style props on both variants', async () => {
    const html = await render(() => (
      <CodeInline className="token" style={{ backgroundColor: '#eee' }}>
        code
      </CodeInline>
    ));

    expect(html).toMatch(/class="token cino\s*"/);
    expect(html).toMatch(/class="token cio\s*"/);
    expect(html).toContain('background-color:#eee');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('className');
  });

  it('forwards shared native attributes without leaking internal props', async () => {
    const html = await render(() => (
      <CodeInline data-testid="inline-code" id="inline" title="Example">
        code
      </CodeInline>
    ));

    expect(html).toContain('id="inline"');
    expect(html).toContain('title="Example"');
    expect(html).toContain('data-testid="inline-code"');
    expect(html).not.toContain('children=');
    expect(html).not.toContain('style="[object Object]"');
  });

  it('lets explicit display style override the Orange.fr fallback span default', async () => {
    const html = await render(() => (
      <CodeInline style={{ display: 'block' }}>code</CodeInline>
    ));

    expect(html).toMatch(
      /<code class="cino\s*" style="display:block">code<\/code>/,
    );
    expect(html).toMatch(
      /<span class="cio\s*" style="display:block">code<\/span>/,
    );
    expect(html).not.toMatch(/<span class="cio\s*" style="display:none"/);
  });

  it('prefers Solid class when both class props are supplied', async () => {
    const html = await render(() => (
      <CodeInline class="solid" className="compat">
        code
      </CodeInline>
    ));

    expect(html).toMatch(/class="solid cino\s*"/);
    expect(html).toMatch(/class="solid cio\s*"/);
    expect(html).not.toContain('compat');
    expect(html).not.toContain('className');
  });
});
