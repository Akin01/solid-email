import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Link } from './link';

describe('Link', () => {
  it('renders defaults', async () => {
    const html = await render(() => (
      <Link href="https://example.com">Example</Link>
    ));

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('color:#067df7');
    expect(html).toContain('text-decoration-line:none');
    expect(html).toContain('Example');
  });

  it('lets explicit target and styles override defaults', async () => {
    const html = await render(() => (
      <Link
        href="https://example.com"
        target="_self"
        style={{ color: 'red', 'text-decoration-line': 'underline' }}
      >
        Test
      </Link>
    ));

    expect(html).toContain('target="_self"');
    expect(html).toContain('color:red');
    expect(html).toContain('text-decoration-line:underline');
  });

  it('passes style and data attributes', async () => {
    const html = await render(() => (
      <Link
        data-testid="link-test"
        href="https://example.com"
        style={{ color: 'red' }}
      >
        Test
      </Link>
    ));

    expect(html).toContain('color:red');
    expect(html).toContain('data-testid="link-test"');
    expect(html).toContain('Test');
  });

  it('emits native class output from the Solid class prop', async () => {
    const html = await render(() => (
      <Link class="external" href="https://example.com">
        Native class
      </Link>
    ));

    expect(html).toMatch(/class="external\s*"/);
    expect(html).not.toContain('className');
  });

  it('normalizes alternate class and camel-case styles while forwarding anchor attrs', async () => {
    const html = await render(() => (
      <Link
        className="external"
        href="https://example.com"
        rel="noreferrer"
        style={{ textDecorationLine: 'underline' }}
      >
        Compatible
      </Link>
    ));

    expect(html).toMatch(/class="external\s*"/);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noreferrer"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('text-decoration-line:underline');
    expect(html).not.toContain('className');
    expect(html).not.toContain('textDecorationLine');
  });
});
