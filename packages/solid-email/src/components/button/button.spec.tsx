import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Button } from './button';
import { convertToPx, parsePadding } from './utils/parse-padding';

describe('Button', () => {
  it('renders email-compatible anchor, padding, and MSO spacer markup', async () => {
    const html = await render(() => (
      <Button href="https://example.com" style={{ padding: '12px 20px' }}>
        Click
      </Button>
    ));

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('line-height:100%');
    expect(html).toContain('text-decoration:none');
    expect(html).toContain('mso-padding-alt:0px');
    expect(html).toContain('padding:12px 20px');
    expect(html).toContain('padding-top:12px');
    expect(html).toContain('padding-right:20px');
    expect(html).toContain('padding-bottom:12px');
    expect(html).toContain('padding-left:20px');
    expect(html).toContain('mso-font-width:500%');
    expect(html).toContain('mso-text-raise:18');
    expect(html).toContain('&#8202;&#8202;');
    expect(html).toContain('&#8203;');
    expect(html).toContain('Click');
  });

  it('passes style and data attributes', async () => {
    const html = await render(() => (
      <Button data-testid="button-test" style={{ 'background-color': 'red' }}>
        Test
      </Button>
    ));

    expect(html).toContain('background-color:red');
    expect(html).toContain('data-testid="button-test"');
    expect(html).toContain('Test');
  });

  it('renders the MSO wrapper without padding values', async () => {
    const html = await render(() => (
      <Button href="https://example.com">No padding</Button>
    ));

    expect(html).toContain('mso-font-width:0%');
    expect(html).toContain('mso-text-raise:0');
    expect(html).toContain('mso-padding-alt:0px');
    expect(html).toContain('No padding');
    expect(html).not.toContain('padding-top');
    expect(html).not.toContain('padding-right');
  });

  it('lets explicit styles override defaults and accepts class', async () => {
    const html = await render(() => (
      <Button
        class="cta"
        style={{
          display: 'block',
          'line-height': '150%',
          'max-width': '50%',
          'text-decoration': 'underline red',
        }}
      >
        Styled
      </Button>
    ));

    expect(html).toMatch(/class="cta\s*"/);
    expect(html).not.toContain('className');
    expect(html).toContain('display:block');
    expect(html).toContain('line-height:150%');
    expect(html).toContain('text-decoration:underline red');
    expect(html).toContain('max-width:50%');
  });

  it('normalizes alternate class and camel-case styles', async () => {
    const html = await render(() => (
      <Button
        className="cta"
        style={{ backgroundColor: 'red', paddingLeft: '10px' }}
      >
        Compatible
      </Button>
    ));

    expect(html).toMatch(/class="cta\s*"/);
    expect(html).toContain('background-color:red');
    expect(html).toContain('padding-left:10px');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('paddingLeft');
  });

  it('forwards explicit anchor attrs and target override', async () => {
    const html = await render(() => (
      <Button href="https://example.com" rel="noreferrer" target="_self">
        Visit
      </Button>
    ));

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noreferrer"');
    expect(html).toContain('target="_self"');
    expect(html).toContain('Visit');
  });

  it('parses padding shorthands and units', () => {
    expect(parsePadding({ padding: '12px 20px' })).toEqual({
      'padding-top': 12,
      'padding-right': 20,
      'padding-bottom': 12,
      'padding-left': 20,
    });
    expect(parsePadding({ padding: '1em 2rem 50% 3px' })).toEqual({
      'padding-top': 16,
      'padding-right': 32,
      'padding-bottom': 300,
      'padding-left': 3,
    });
    expect(parsePadding({ padding: '4px', 'padding-left': '9px' })).toEqual({
      'padding-top': 4,
      'padding-right': 4,
      'padding-bottom': 4,
      'padding-left': 9,
    });
    expect(parsePadding({ padding: '4px', 'padding-right': '7px' })).toEqual({
      'padding-top': 4,
      'padding-right': 7,
      'padding-bottom': 4,
      'padding-left': 4,
    });
    expect(convertToPx('bad')).toBe(0);
  });
});
