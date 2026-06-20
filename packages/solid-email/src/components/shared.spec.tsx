import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Column } from './column';
import { Html } from './html';
import { Row } from './row';
import { Text } from './text';

describe('Solid style and class props', () => {
  it('serializes kebab-case CSS properties', async () => {
    const html = await render(() => (
      <Text
        style={{
          'background-color': '#fff',
          'font-size': '18px',
          'line-height': '28px',
        }}
      >
        Hello
      </Text>
    ));

    expect(html).toContain('background-color:#fff');
    expect(html).toContain('font-size:18px');
    expect(html).toContain('line-height:28px');
    expect(html).not.toContain('fontSize');
  });

  it('keeps class support without leaking internal props', async () => {
    const html = await render(() => <Text class="copy">Hello</Text>);

    expect(html).toMatch(/class="copy\s*"/);
    expect(html).not.toContain('className');
  });

  it('accepts alternate class prop names and emits native class output', async () => {
    const html = await render(() => (
      <Text className="copy" style={{ backgroundColor: '#fff' }}>
        Hello
      </Text>
    ));

    expect(html).toMatch(/class="copy\s*"/);
    expect(html).toContain('background-color:#fff');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
  });

  it('serializes kebab-case styles on table-cell primitives', async () => {
    const html = await render(() => (
      <Column style={{ 'background-color': 'red', 'max-width': '300px' }}>
        Cell
      </Column>
    ));

    expect(html).toContain('style="background-color:red;max-width:300px"');
    expect(html).not.toContain('maxWidth');
  });

  it('serializes kebab-case styles on table primitives', async () => {
    const html = await render(() => (
      <Row style={{ 'background-color': 'red' }}>
        <Column>Cell</Column>
      </Row>
    ));

    expect(html).toContain('style="background-color:red"');
    expect(html).not.toContain('backgroundColor');
  });

  it('serializes kebab-case styles on document primitives', async () => {
    const html = await render(() => (
      <Html style={{ 'background-color': 'white' }}>
        <span>Cell</span>
      </Html>
    ));

    expect(html).toContain('style="background-color:white"');
    expect(html).not.toContain('backgroundColor');
  });

  it('preserves email-specific and data attributes on table primitives', async () => {
    const html = await render(() => (
      <Column
        attr:align="right"
        attr:valign="top"
        data-testid="column-test"
        attr:width="50%"
      >
        Cell
      </Column>
    ));

    expect(html).toContain('align="right"');
    expect(html).toContain('data-testid="column-test"');
    expect(html).toContain('valign="top"');
    expect(html).toContain('width="50%"');
  });
});
