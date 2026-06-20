import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Container } from './container';

describe('Container', () => {
  it('renders email-compatible presentation table', async () => {
    const html = await render(() => (
      <Container>
        <button type="button">Hi</button>
      </Container>
    ));

    expect(html).toContain('<table align="center" width="100%"');
    expect(html).toContain('border="0"');
    expect(html).toContain('cellpadding="0"');
    expect(html).toContain('cellspacing="0"');
    expect(html).toContain('role="presentation"');
    expect(html).toContain('max-width:37.5em');
    expect(html).toContain('<tr style="width:100%">');
    expect(html).toContain('<button type="button">Hi</button>');
  });

  it('splits padding to inner cell for email-client compatibility', async () => {
    const html = await render(() => (
      <Container
        style={{ 'max-width': '300px', padding: '8px', 'padding-top': '12px' }}
      >
        Hi
      </Container>
    ));

    expect(html).toContain('max-width:300px');
    expect(html).not.toContain('max-width:37.5em;padding');
    expect(html).toContain('style="padding:8px;padding-top:12px"');
  });

  it('passes style and data attributes to the table', async () => {
    const html = await render(() => (
      <Container
        class="container"
        data-testid="container-test"
        style={{ 'max-width': '300px', 'background-color': 'red' }}
      >
        Test
      </Container>
    ));

    expect(html).toContain('style="max-width:300px;background-color:red"');
    expect(html).toContain('data-testid="container-test"');
    expect(html).toMatch(/class="container\s*"/);
    expect(html).toContain('Test');
  });

  it('normalizes className and camel-case styles while splitting padding', async () => {
    const html = await render(() => (
      <Container
        aria-label="outer container"
        className="wrap"
        style={{ backgroundColor: '#eee', paddingLeft: 12, maxWidth: 320 }}
      >
        Hi
      </Container>
    ));

    expect(html).toMatch(/class="wrap\s*"/);
    expect(html).toContain('aria-label="outer container"');
    expect(html).toContain('style="max-width:320px;background-color:#eee"');
    expect(html).toContain('style="padding-left:12px"');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('paddingLeft');
    expect(html).not.toContain('maxWidth');
  });

  it('normalizes native string styles while splitting padding', async () => {
    const html = await render(() => (
      <Container style="background-color:#eee;padding-left:12px">Hi</Container>
    ));

    expect(html).toContain('style="max-width:37.5em;background-color:#eee"');
    expect(html).toContain('style="padding-left:12px"');
    expect(html).toContain('Hi');
  });
});
