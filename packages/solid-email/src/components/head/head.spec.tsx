import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Head } from './head';

describe('Head', () => {
  it('renders default email meta tags', async () => {
    const html = await render(() => <Head />);

    expect(html).toContain('<head');
    expect(html).toContain(
      '<meta content="text/html; charset=UTF-8" http-equiv="content-type"',
    );
    expect(html).toContain('<meta name="x-apple-disable-message-reformatting"');
  });

  it('renders child content', async () => {
    const html = await render(() => <Head>Test message</Head>);

    expect(html).toContain('Test message');
  });

  it('preserves custom head children after default metadata', async () => {
    const html = await render(() => (
      <Head>
        <style>{'body{color:red}'}</style>
      </Head>
    ));

    expect(html).toContain('<style>body{color:red}</style>');
  });

  it('normalizes global attributes without leaking compatibility props', async () => {
    const html = await render(() => (
      <Head
        data-head="custom"
        className="email-head"
        style={{ backgroundColor: '#fff' }}
      >
        <title>Message</title>
      </Head>
    ));

    expect(html).toMatch(/class="email-head\s*"/);
    expect(html).toContain('style="background-color:#fff"');
    expect(html).toContain('data-head="custom"');
    expect(html).toContain('<title>Message</title>');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
  });
});
