import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Text } from './text';

describe('Text', () => {
  it('renders email-compatible paragraph defaults', async () => {
    const html = await render(() => <Text>Lorem ipsum</Text>);

    expect(html).toContain('<p style="');
    expect(html).toContain('font-size:14px');
    expect(html).toContain('line-height:24px');
    expect(html).toContain('margin-top:16px');
    expect(html).toContain('margin-bottom:16px');
    expect(html).toContain('Lorem ipsum');
  });

  it('preserves explicit margins and normalizes CSS keys', async () => {
    const html = await render(() => (
      <Text
        style={{
          'margin-top': 0,
          'margin-bottom': '4px',
          'background-color': '#eee',
        }}
      >
        Styled
      </Text>
    ));

    expect(html).toContain('margin-top:0');
    expect(html).toContain('margin-bottom:4px');
    expect(html).toContain('background-color:#eee');
    expect(html).not.toContain('backgroundColor');
  });

  it('expands margin shorthand and lets explicit side margins win by order', async () => {
    const html = await render(() => (
      <Text style={{ margin: '12px', 'margin-top': '0px' }}>Priority</Text>
    ));

    expect(html).toContain('margin:12px');
    expect(html).toContain('margin-top:0px');
    expect(html).toContain('margin-bottom:12px');
    expect(html).toContain('margin-left:12px');
    expect(html).toContain('margin-right:12px');
  });

  it('passes data attributes and explicit font styles', async () => {
    const html = await render(() => (
      <Text data-testid="text-test" style={{ 'font-size': '16px' }}>
        Test
      </Text>
    ));

    expect(html).toContain('data-testid="text-test"');
    expect(html).toContain('font-size:16px');
    expect(html).toContain('line-height:24px');
  });

  it('emits native class output from the Solid class prop', async () => {
    const html = await render(() => <Text class="copy">Native class</Text>);

    expect(html).toMatch(/class="copy\s*"/);
    expect(html).not.toContain('className');
  });

  it('normalizes alternate class and camel-case styles without leaking props', async () => {
    const html = await render(() => (
      <Text
        className="copy"
        id="intro"
        style={{ backgroundColor: '#fff', marginTop: '2px' }}
      >
        Compatible
      </Text>
    ));

    expect(html).toMatch(/class="copy\s*"/);
    expect(html).toContain('id="intro"');
    expect(html).toContain('background-color:#fff');
    expect(html).toContain('margin-top:2px');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('marginTop');
  });
});
