import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { CodeBlock } from './code-block';
import { Prism } from './prism';
import { xonokai } from './themes';

describe('CodeBlock', () => {
  it('renders highlighted code with theme and fontFamily override', async () => {
    const html = await render(() => (
      <CodeBlock
        code="const x = 1;"
        language="javascript"
        theme={xonokai}
        fontFamily="Courier"
      />
    ));

    expect(html).toContain('<pre');
    expect(html).toContain('overflow:auto');
    expect(html).toContain('width:100%');
    expect(html).toContain('font-family:Courier');
    expect(html).toContain('const');
    expect(html).toContain('x');
  });

  it('can show line-number spans', async () => {
    const hidden = await render(() => (
      <CodeBlock code="const x = 1;" language="javascript" theme={xonokai} />
    ));
    const shown = await render(() => (
      <CodeBlock
        code="const x = 1;"
        language="javascript"
        theme={xonokai}
        lineNumbers
      />
    ));

    expect(hidden).not.toContain('width:2em');
    expect(shown).toContain('width:2em');
    expect(shown).toContain('display:inline-block');
  });

  it('loads and styles grammars for typed language aliases beyond JavaScript', async () => {
    const html = await render(() => (
      <CodeBlock
        code={'def f():\n  return 1'}
        language="python"
        theme={{
          base: {},
          keyword: { color: 'purple' },
        }}
      />
    ));

    expect(html).toContain('def');
    expect(html).toContain('return');
    expect(html).toContain('color:purple');
    expect(html).not.toContain('There is no language defined');
  });

  it('loads markup aliases from the Prism registry', async () => {
    const html = await render(() => (
      <CodeBlock code="<div>Hello</div>" language="html" theme={xonokai} />
    ));

    expect(html).toContain('&lt;');
    expect(html).toContain('Hello');
    expect(html).not.toContain('There is no language defined');
  });

  it('applies theme styles to markup tokens from alias grammars', async () => {
    const html = await render(() => (
      <CodeBlock
        code={'<span title="x">Hi</span>'}
        language="html"
        theme={{
          base: {},
          'attr-name': { fontWeight: 'bold' },
          tag: { color: 'teal' },
        }}
      />
    ));

    expect(html).toContain('&lt;');
    expect(html).toContain('title');
    expect(html).toContain('color:teal');
    expect(html).toContain('font-weight:bold');
  });

  it('throws when the requested Prism grammar is missing', async () => {
    await expect(() =>
      render(() => (
        <CodeBlock
          code="x"
          language={'not-a-language' as 'javascript'}
          theme={xonokai}
        />
      )),
    ).rejects.toThrow(
      'CodeBlock: There is no language defined on Prism called not-a-language',
    );
  });

  it('normalizes custom theme style keys on token spans', async () => {
    const html = await render(() => (
      <CodeBlock
        code="const x = 1;"
        language="javascript"
        theme={{
          base: {},
          keyword: { backgroundColor: '#333', fontWeight: 'bold' },
        }}
      />
    ));

    expect(html).toContain('background-color:#333');
    expect(html).toContain('font-weight:bold');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('fontWeight');
  });

  it('renders Solid class and kebab-case style props as native HTML', async () => {
    const html = await render(() => (
      <CodeBlock
        class="snippet"
        code="const x = 1;"
        language="javascript"
        style={{ 'background-color': '#111', 'max-width': '480px' }}
        theme={xonokai}
      />
    ));

    expect(html).toMatch(/class="snippet\s*"/);
    expect(html).toContain('background-color:#111');
    expect(html).toContain('max-width:480px');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
  });

  it('normalizes alternate class and style props to native HTML', async () => {
    const html = await render(() => (
      <CodeBlock
        className="snippet"
        code="const x = 1;"
        language="javascript"
        style={{ backgroundColor: '#222', maxWidth: 480 }}
        theme={xonokai}
      />
    ));

    expect(html).toMatch(/class="snippet\s*"/);
    expect(html).toContain('background-color:#222');
    expect(html).toContain('max-width:480px');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('maxWidth');
  });

  it('prefers Solid class when class and className are both provided', async () => {
    const html = await render(() => (
      <CodeBlock
        class="solid"
        className="compat"
        code="const x = 1;"
        language="javascript"
        theme={xonokai}
      />
    ));

    expect(html).toMatch(/class="solid\s*"/);
    expect(html).not.toContain('compat');
    expect(html).not.toContain('className');
  });

  it('forwards native pre attributes without leaking internal props', async () => {
    const html = await render(() => (
      <CodeBlock
        aria-label="Example code"
        code="const x = 1;"
        data-testid="code-block"
        id="snippet"
        language="javascript"
        theme={xonokai}
        title="Example code"
      />
    ));

    expect(html).toContain('id="snippet"');
    expect(html).toContain('data-testid="code-block"');
    expect(html).toContain('aria-label="Example code"');
    expect(html).toContain('title="Example code"');
    expect(html).not.toContain('code="');
    expect(html).not.toContain('theme="');
    expect(html).not.toContain('language="');
  });

  it('orders theme base, default, and prop styles on the pre element', async () => {
    const defaultWidth = await render(() => (
      <CodeBlock
        code="x"
        language="javascript"
        theme={{ base: { background: '#222', width: '50%' } }}
      />
    ));
    const explicitWidth = await render(() => (
      <CodeBlock
        code="x"
        language="javascript"
        style={{ background: '#111', width: '320px' }}
        theme={{ base: { background: '#222', width: '50%' } }}
      />
    ));

    expect(defaultWidth).toContain('background:#222');
    expect(defaultWidth).toContain('width:100%');
    expect(defaultWidth).not.toContain('width:50%');
    expect(explicitWidth).toContain('background:#111');
    expect(explicitWidth).toContain('width:320px');
    expect(explicitWidth).not.toContain('background:#222');
    expect(explicitWidth).not.toContain('width:100%');
  });

  it('normalizes camel-case theme base styles before rendering', async () => {
    const html = await render(() => (
      <CodeBlock
        code="const x = 1;"
        language="javascript"
        theme={{
          base: { backgroundColor: '#222', maxWidth: 480 },
        }}
      />
    ));

    expect(html).toContain('background-color:#222');
    expect(html).toContain('max-width:480px');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('maxWidth');
  });

  it('renders one line-number span for each normalized code line', async () => {
    const html = await render(() => (
      <CodeBlock
        code={'first\nsecond\r\nthird\rfourth\n'}
        language="javascript"
        lineNumbers
        theme={xonokai}
      />
    ));

    expect(html.match(/display:inline-block/g) ?? []).toHaveLength(5);
    expect(html).toContain('>1</span>');
    expect(html).toContain('>5</span>');
    expect(html).not.toContain('>6</span>');
  });

  it('propagates fontFamily to line numbers and highlighted code', async () => {
    const html = await render(() => (
      <CodeBlock
        code="const x = 1;"
        fontFamily="Menlo"
        language="javascript"
        lineNumbers
        theme={{ base: {}, keyword: { color: 'purple' } }}
      />
    ));

    expect(html).toContain('display:inline-block;font-family:Menlo">1</span>');
    expect(html).toContain(
      'style="font-family:Menlo;color:purple">const</span>',
    );
  });

  it('preserves leading, trailing, and consecutive spaces inside plain string tokens', async () => {
    const preservedSpace = '\xA0\u200D\u200B';
    const html = await render(() => (
      <CodeBlock code=" a  b " language="javascript" theme={xonokai} />
    ));

    expect(html).toContain(
      `${preservedSpace}a${preservedSpace}${preservedSpace}b${preservedSpace}`,
    );
    expect(html).not.toContain('> a  b </span>');
  });

  it('merges Prism token aliases after token styles in alias order', async () => {
    const language = 'code-block-test-alias';
    Prism.languages[language] = {
      word: { pattern: /foo/, alias: ['first-alias', 'second-alias'] },
    };

    try {
      const html = await render(() => (
        <CodeBlock
          code="foo"
          language={language as 'javascript'}
          theme={{
            base: {},
            word: { color: 'red', fontWeight: 'normal' },
            'first-alias': { color: 'blue', fontStyle: 'italic' },
            'second-alias': { color: 'green', textDecoration: 'underline' },
          }}
        />
      ));

      expect(html).toContain('color:green');
      expect(html).not.toContain('color:red');
      expect(html).not.toContain('color:blue');
      expect(html).toContain('font-style:italic');
      expect(html).toContain('font-weight:normal');
      expect(html).toContain('text-decoration:underline');
    } finally {
      delete Prism.languages[language];
    }
  });

  it('inherits outer styles into nested Prism tokens and lets inner styles win', async () => {
    const language = 'code-block-test-nested';
    Prism.languages[language] = {
      outer: {
        pattern: /foo/,
        inside: {
          inner: /foo/,
        },
      },
    };

    try {
      const html = await render(() => (
        <CodeBlock
          code="foo"
          language={language as 'javascript'}
          theme={{
            base: {},
            inner: { color: 'blue' },
            outer: { backgroundColor: '#eee', color: 'red' },
          }}
        />
      ));

      expect(html).toContain('style="background-color:#eee;color:blue"');
      expect(html).not.toContain('color:red');
    } finally {
      delete Prism.languages[language];
    }
  });
});
