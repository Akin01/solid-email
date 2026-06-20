import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Body } from './body';
import { marginProperties, paddingProperties } from './margin-properties';

function elementStyle(html: string, tag: 'body' | 'td') {
  const match = new RegExp(`<${tag}[^>]*style="([^"]*)"`).exec(html);
  expect(match).toBeDefined();
  return match?.[1] ?? '';
}

describe('Body', () => {
  it('renders correctly', async () => {
    const html = await render(() => <Body>Lorem ipsum</Body>);

    expect(html).toMatchInlineSnapshot(
      `"<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><body dir="ltr" lang="en"><table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"><tbody><tr><td dir="ltr" lang="en">Lorem ipsum</td></tr></tbody></table></body>"`,
    );
  });

  it('passes style and data attributes to the body and inner cell', async () => {
    const html = await render(() => (
      <Body data-testid="body-test" style={{ 'background-color': 'red' }}>
        Test
      </Body>
    ));

    const bodyStyle = elementStyle(html, 'body');
    const tdStyle = elementStyle(html, 'td');

    expect(bodyStyle).toBe('background-color:red');
    expect(tdStyle).toBe('background-color:red');
    expect(html).toContain('data-testid="body-test"');
  });

  it('resets body margin while preserving it on the inner cell', async () => {
    const html = await render(() => (
      <Body style={{ 'margin-top': '10px', 'padding-left': '12px' }}>
        Random text
      </Body>
    ));

    const bodyStyle = elementStyle(html, 'body');
    const tdStyle = elementStyle(html, 'td');

    expect(bodyStyle).toContain('margin-top:0');
    expect(bodyStyle).toContain('padding-left:0');
    expect(bodyStyle).not.toContain('margin-top:10px');
    expect(bodyStyle).not.toContain('padding-left:12px');
    expect(tdStyle).toContain('margin-top:10px');
    expect(tdStyle).toContain('padding-left:12px');
  });

  it('resets logical margin and padding properties', async () => {
    const html = await render(() => (
      <Body style={{ 'margin-inline': '10px', 'padding-block': '12px' }}>
        Random text
      </Body>
    ));

    const bodyStyle = elementStyle(html, 'body');
    const tdStyle = elementStyle(html, 'td');

    expect(bodyStyle).toContain('margin-inline:0');
    expect(bodyStyle).toContain('padding-block:0');
    expect(bodyStyle).not.toContain('margin-inline:10px');
    expect(bodyStyle).not.toContain('padding-block:12px');
    expect(tdStyle).toContain('margin-inline:10px');
    expect(tdStyle).toContain('padding-block:12px');
  });

  it('resets side-specific margin and padding properties', async () => {
    const html = await render(() => (
      <Body style={{ 'margin-top': '10px', 'padding-left': '12px' }}>
        Random text
      </Body>
    ));

    const bodyStyle = elementStyle(html, 'body');
    const tdStyle = elementStyle(html, 'td');

    expect(bodyStyle).toContain('margin-top:0');
    expect(bodyStyle).toContain('padding-left:0');
    expect(bodyStyle).not.toContain('margin-top:10px');
    expect(bodyStyle).not.toContain('padding-left:12px');
    expect(tdStyle).toContain('margin-top:10px');
    expect(tdStyle).toContain('padding-left:12px');
  });

  for (const property of marginProperties) {
    it(`resets ${property} on the body and keeps it on the inner cell`, async () => {
      const html = await render(() => (
        <Body style={{ [property]: 10 }}>Random text</Body>
      ));
      const bodyStyle = elementStyle(html, 'body');
      const tdStyle = elementStyle(html, 'td');

      expect(bodyStyle).toContain(`${property}:0`);
      expect(bodyStyle).not.toContain(`${property}:10px`);
      expect(tdStyle).toContain(`${property}:10px`);
    });
  }

  for (const property of paddingProperties) {
    it(`resets ${property} on the body and keeps it on the inner cell`, async () => {
      const html = await render(() => (
        <Body style={{ [property]: '10px' }}>Random text</Body>
      ));
      const bodyStyle = elementStyle(html, 'body');
      const tdStyle = elementStyle(html, 'td');

      expect(bodyStyle).toContain(`${property}:0`);
      expect(bodyStyle).not.toContain(`${property}:10px`);
      expect(tdStyle).toContain(`${property}:10px`);
    });
  }

  it('accepts class and background-color styles', async () => {
    const html = await render(() => (
      <Body class="mail" style={{ 'background-color': '#fff' }}>
        Hi
      </Body>
    ));

    const bodyStyle = elementStyle(html, 'body');
    const tdStyle = elementStyle(html, 'td');

    expect(html).toMatch(/class="mail\s*"/);
    expect(bodyStyle).toBe('background-color:#fff');
    expect(tdStyle).toBe('background-color:#fff');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('className');
  });

  it('normalizes className, camel-case styles, and native attributes without leaking compatibility props', async () => {
    const html = await render(() => (
      <Body
        aria-label="email body"
        className="mail"
        style={{ backgroundColor: '#fff', marginTop: 10 }}
      >
        Hi
      </Body>
    ));

    const bodyStyle = elementStyle(html, 'body');
    const tdStyle = elementStyle(html, 'td');

    expect(html).toMatch(/class="mail\s*"/);
    expect(html).toContain('aria-label="email body"');
    expect(bodyStyle).toContain('background-color:#fff');
    expect(bodyStyle).toContain('margin-top:0');
    expect(tdStyle).toContain('background-color:#fff');
    expect(tdStyle).toContain('margin-top:10px');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('marginTop');
  });

  it('normalizes native string styles for body reset and inner cell preservation', async () => {
    const html = await render(() => (
      <Body style="background-color:#eee;margin-top:10px;color:#111">Hi</Body>
    ));

    expect(elementStyle(html, 'body')).toBe(
      'background-color:#eee;margin-top:0',
    );
    expect(elementStyle(html, 'td')).toBe(
      'background-color:#eee;margin-top:10px;color:#111',
    );
  });
});
