import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Row } from './row';

describe('Row', () => {
  it('renders email-compatible presentation table and width styles', async () => {
    const html = await render(() => (
      <Row>
        <td>ok</td>
      </Row>
    ));

    expect(html).toContain('<table align="center" width="100%" border="0"');
    expect(html).toContain('cellpadding="0"');
    expect(html).toContain('cellspacing="0"');
    expect(html).toContain('role="presentation"');
    expect(html).toContain('<tbody style="width:100%">');
    expect(html).toContain('<tr style="width:100%"><td>ok</td></tr>');
  });

  it('passes style and data attributes to the table', async () => {
    const html = await render(() => (
      <Row
        class="row-native"
        data-testid="row-test"
        style={{ 'background-color': 'red' }}
      >
        Test
      </Row>
    ));

    expect(html).toContain('style="background-color:red"');
    expect(html).toContain('data-testid="row-test"');
    expect(html).toMatch(/class="row-native\s*"/);
    expect(html).toContain('Test');
  });

  it('normalizes className and camel-case styles without leaking compatibility props', async () => {
    const html = await render(() => (
      <Row
        aria-label="email row"
        className="row"
        style={{ backgroundColor: 'red', maxWidth: 600 }}
      >
        <td>Test</td>
      </Row>
    ));

    expect(html).toMatch(/class="row\s*"/);
    expect(html).toContain('aria-label="email row"');
    expect(html).toContain('style="background-color:red;max-width:600px"');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('maxWidth');
  });
});
