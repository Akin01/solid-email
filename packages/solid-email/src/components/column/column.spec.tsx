import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Column } from './column';

describe('Column', () => {
  it('renders data marker and content', async () => {
    const html = await render(() => <Column>Lorem ipsum</Column>);

    expect(html).toContain(
      '<td data-id="_solid-email-column">Lorem ipsum</td>',
    );
  });

  it('passes style and data attributes', async () => {
    const html = await render(() => (
      <Column data-testid="column-test" style={{ 'background-color': 'red' }}>
        Test
      </Column>
    ));

    expect(html).toContain('style="background-color:red"');
    expect(html).toContain('data-testid="column-test"');
    expect(html).toContain('Test');
  });

  it('accepts class', async () => {
    const html = await render(() => <Column class="col">Hi</Column>);

    expect(html).toMatch(/class="col\s*"/);
    expect(html).not.toContain('className');
  });

  it('normalizes className, camel-case styles, and native attributes without leaking compatibility props', async () => {
    const html = await render(() => (
      <Column
        attr:align="right"
        attr:valign="top"
        className="compat-col"
        style={{ backgroundColor: '#ddd', maxWidth: 200 }}
      >
        Hi
      </Column>
    ));

    expect(html).toMatch(/class="compat-col\s*"/);
    expect(html).toContain('align="right"');
    expect(html).toContain('valign="top"');
    expect(html).toContain('data-id="_solid-email-column"');
    expect(html).toContain('style="background-color:#ddd;max-width:200px"');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('maxWidth');
  });
});
