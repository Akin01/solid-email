import type { JSX } from '@solidjs/web';
import { createMemo, Loading } from 'solid-js';
import { describe, expect, it } from 'vitest';
import { render, renderSync } from './render';
import { pretty } from './utils/pretty';
import { toPlainText } from './utils/to-plain-text';

const wait = (value: string) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(value), 1));

function Throwing(): JSX.Element {
  throw new Error('boom');
}

function AsyncGreeting() {
  const greeting = createMemo(() => wait('Hello async'));
  return <span>{greeting()}</span>;
}

describe('render', () => {
  it('renders Solid JSX with the email doctype', async () => {
    const html = await render(() => <div>Hello 世界</div>);
    expect(
      html.startsWith(
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
      ),
    ).toBe(true);
    expect(html).toContain('<div>Hello 世界</div>');
  });

  it('renders an already constructed JSX node', async () => {
    const node = <p>Constructed node</p>;
    const html = await render(node);

    expect(html).toContain('<p>Constructed node</p>');
  });

  it('strips nested doctypes before adding the email doctype', async () => {
    const html = await render(() => (
      <>
        {'<!DOCTYPE html>'}
        <main>content</main>
      </>
    ));

    expect(html.match(/<!DOCTYPE/g)).toHaveLength(1);
    expect(html).toContain('<main>content</main>');
  });

  it('pretties rendered html when requested', async () => {
    const html = await render(
      () => (
        <div>
          <span>Hello</span>
        </div>
      ),
      {
        pretty: true,
      },
    );

    expect(html).toContain('\n');
    expect(html).toContain('<div><span>Hello</span></div>');
  });

  it('converts raw html to plain text before doctype insertion', async () => {
    const text = await render(
      () => (
        <div>
          <img alt="" src="x.png" />
          Hello <a href="https://example.com">https://example.com</a>
          <span data-skip-in-text="true">skip</span>
        </div>
      ),
      { plainText: true },
    );
    expect(text).toContain('Hello https://example.com');
    expect(text).not.toContain('skip');
    expect(text).not.toContain('DOCTYPE');
  });

  it('converts heading and paragraph email markup into plain text', async () => {
    const text = await render(
      () => (
        <div>
          <h1>Welcome, Jim!</h1>
          <p>Thanks for trying our product.</p>
        </div>
      ),
      { plainText: true },
    );

    expect(text).toContain('WELCOME, JIM!');
    expect(text).toContain('Thanks for trying our product.');
    expect(text).not.toContain('<h1>');
    expect(text).not.toContain('DOCTYPE');
  });

  it('plain-text output takes precedence over pretty output', async () => {
    const text = await render(
      () => (
        <div>
          <strong>Hello</strong>
          <span>World</span>
        </div>
      ),
      { plainText: true, pretty: true },
    );

    expect(text).toBe('HelloWorld');
    expect(text).not.toContain('<!DOCTYPE');
    expect(text).not.toContain('<strong>');
  });

  it('passes plain-text conversion options without losing defaults', async () => {
    const text = await render(
      () => (
        <div>
          <p>Visible</p>
          <em>hidden emphasis</em>
          <img alt="hidden" src="image.png" />
          <span data-skip-in-text="true">hidden span</span>
          <a href="https://example.com">https://example.com</a>
        </div>
      ),
      {
        htmlToTextOptions: {
          selectors: [{ selector: 'em', format: 'skip' }],
        },
        plainText: true,
      },
    );

    expect(text).toContain('Visible');
    expect(text).not.toContain('hidden emphasis');
    expect(text).not.toContain('hidden image');
    expect(text).not.toContain('hidden span');
    expect(text.match(/https:\/\/example\.com/g)).toHaveLength(1);
  });

  it('rejects component errors', async () => {
    await expect(render(() => <Throwing />)).rejects.toThrow('boom');
  });

  it('awaits async Solid SSR content', async () => {
    const html = await render(() => (
      <Loading fallback={<span>loading</span>}>
        <AsyncGreeting />
      </Loading>
    ));
    expect(html).toContain('Hello async');
    expect(html).not.toContain('loading');
    expect(html).not.toContain('<script');
  });

  it('keeps multibyte text intact', async () => {
    const html = await render(() => (
      <section>
        <p>Test Normal 情報Ⅰコース担当者様</p>
        <p>平素よりお世話になっております。 情報Ⅰサポートチームです。</p>
      </section>
    ));

    expect(html).toContain('情報Ⅰコース担当者様');
    expect(html).toContain('平素よりお世話になっております。');
  });

  it('renders large email bodies without resource scripts', async () => {
    const paragraphs = Array.from({ length: 100 }, (_, index) => (
      <p>
        This is paragraph {index} with enough content to exercise the renderer
        on a larger email body.
      </p>
    ));

    const html = await render(() => (
      <div>
        <h1>Large Email Test</h1>
        {paragraphs}
      </div>
    ));

    expect(html).toContain('Large Email Test');
    expect(html).toContain('This is paragraph 99');
    expect(html).not.toContain('<script');
  });

  it('rejects async Solid SSR resource errors', async () => {
    function AsyncError(): JSX.Element {
      const value = createMemo(async () => {
        throw new Error('async boom');
      });
      return <Loading>{value()}</Loading>;
    }

    await expect(render(() => <AsyncError />)).rejects.toThrow('async boom');
  });

  it('rejects serialized async resource errors with escaped characters intact', async () => {
    function AsyncEscapedError(): JSX.Element {
      const value = createMemo(async () => {
        throw new Error('async "boom" 情報Ⅰ');
      });
      return <Loading>{value()}</Loading>;
    }

    await expect(render(() => <AsyncEscapedError />)).rejects.toThrow(
      'async "boom" 情報Ⅰ',
    );
  });
});

describe('renderSync', () => {
  it('renders static Solid JSX with the email doctype synchronously', () => {
    const html: string = renderSync(() => <div>Hello sync</div>);

    expect(html).toContain('<!DOCTYPE html PUBLIC');
    expect(html).toContain('<div>Hello sync</div>');
  });

  it('renders an already constructed JSX node synchronously', () => {
    const node = <p>Constructed sync node</p>;
    const html = renderSync(node);

    expect(html).toContain('<p>Constructed sync node</p>');
  });

  it('converts static Solid JSX to plain text synchronously', () => {
    const text = renderSync(
      () => (
        <div>
          <img alt="" src="x.png" />
          Hello <a href="https://example.com">https://example.com</a>
          <span data-skip-in-text="true">skip</span>
        </div>
      ),
      { plainText: true },
    );

    expect(text).toContain('Hello https://example.com');
    expect(text).not.toContain('skip');
    expect(text).not.toContain('DOCTYPE');
  });

  it('rejects sync component errors', () => {
    expect(() => renderSync(() => <Throwing />)).toThrow('boom');
  });

  it('does not wait for async Loading content', () => {
    const html = renderSync(() => (
      <Loading fallback={<span>loading sync</span>}>
        <AsyncGreeting />
      </Loading>
    ));

    expect(html).toContain('loading sync');
    expect(html).not.toContain('Hello async');
  });
});

describe('utilities', () => {
  it('exposes plain text conversion defaults', () => {
    expect(toPlainText('<p>Hello <img src="x" /></p>')).toBe('Hello');
  });

  it('preserves plain-text defaults with custom selectors', () => {
    const text = toPlainText(
      '<p>Hello</p><em>skip me</em><img alt="hidden" src="x.png"><span data-skip-in-text="true">hidden span</span><a href="https://example.com">https://example.com</a>',
      {
        selectors: [{ selector: 'em', format: 'skip' }],
      },
    );

    expect(text).toContain('Hello');
    expect(text).not.toContain('skip me');
    expect(text).not.toContain('hidden');
    expect(text.match(/https:\/\/example\.com/g)).toHaveLength(1);
  });

  it('pretties html and preserves MSO conditional comment contents', async () => {
    const output = await pretty(
      '<span><!--[if mso]><i style="mso-font-width:100%;mso-text-raise:12" hidden>&#8202;&#8202;</i><![endif]--></span>',
    );
    expect(output).toContain(
      '<!--[if mso]><i style="mso-font-width:100%;mso-text-raise:12" hidden>&#8202;&#8202;</i><![endif]-->',
    );
  });
});
