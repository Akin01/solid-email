import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Heading } from './heading';

describe('Heading', () => {
  it('renders the selected heading tag', async () => {
    const html = await render(() => <Heading as="h2">Lorem ipsum</Heading>);

    expect(html).toContain('<h2');
    expect(html).toContain('Lorem ipsum');
    expect(html).toContain('</h2>');
  });

  it('supports margin aliases and class', async () => {
    const html = await render(() => (
      <Heading as="h2" mx={4} mt={8} class="title">
        Spaced
      </Heading>
    ));

    expect(html).toMatch(/class="title\s*"/);
    expect(html).toContain('margin-left:4px');
    expect(html).toContain('margin-right:4px');
    expect(html).toContain('margin-top:8px');
    expect(html).not.toContain('className');
  });

  it('normalizes alternate class and camel-case styles', async () => {
    const html = await render(() => (
      <Heading as="h3" className="title" style={{ backgroundColor: 'red' }}>
        Compatible
      </Heading>
    ));

    expect(html).toMatch(/class="title\s*"/);
    expect(html).toContain('background-color:red');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
  });

  it('passes style and data attributes', async () => {
    const html = await render(() => (
      <Heading data-testid="heading-test" style={{ 'background-color': 'red' }}>
        Test
      </Heading>
    ));

    expect(html).toContain('background-color:red');
    expect(html).toContain('data-testid="heading-test"');
    expect(html).toContain('Test');
  });

  it('lets explicit styles override margin props without leaking internals', async () => {
    const html = await render(() => (
      <Heading
        as="h4"
        data-testid="heading-override"
        mt={8}
        style={{ marginTop: '10px' }}
      >
        Override
      </Heading>
    ));

    expect(html).toContain('<h4');
    expect(html).toContain('data-testid="heading-override"');
    expect(html).toContain('margin-top:10px');
    expect(html).not.toContain('margin-top:8px');
    expect(html).not.toContain('as="h4"');
    expect(html).not.toContain('mt="8"');
    expect(html).not.toContain('marginTop');
  });
});
