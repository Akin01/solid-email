import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Hr } from './hr';

describe('Hr', () => {
  it('renders email-compatible defaults', async () => {
    const html = await render(() => <Hr />);

    expect(html).toContain('<hr');
    expect(html).toContain('width:100%');
    expect(html).toContain('border:none');
    expect(html).toContain('border-color:transparent');
    expect(html).toContain('border-top:1px solid #eaeaea');
  });

  it('normalizes explicit style overrides', async () => {
    const html = await render(() => (
      <Hr style={{ 'border-top': '2px solid red' }} />
    ));

    expect(html).toContain('border-top:2px solid red');
    expect(html).not.toContain('borderTop');
  });

  it('passes style and data attributes', async () => {
    const html = await render(() => (
      <Hr
        data-testid="hr-test"
        style={{ width: '50%', 'border-color': 'black' }}
      />
    ));

    expect(html).toContain('width:50%');
    expect(html).toContain('border-color:black');
    expect(html).toContain('data-testid="hr-test"');
  });

  it('emits native class output from the Solid class prop', async () => {
    const html = await render(() => <Hr class="rule" />);

    expect(html).toMatch(/class="rule\s*"/);
    expect(html).not.toContain('className');
  });

  it('normalizes alternate class and camel-case styles while forwarding native attrs', async () => {
    const html = await render(() => (
      <Hr
        aria-hidden="true"
        className="rule"
        style={{ borderTop: '3px solid blue' }}
      />
    ));

    expect(html).toMatch(/class="rule\s*"/);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('border-top:3px solid blue');
    expect(html).not.toContain('className');
    expect(html).not.toContain('borderTop');
  });
});
