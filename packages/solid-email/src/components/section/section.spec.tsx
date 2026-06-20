import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Section } from './section';

describe('Section', () => {
  it('renders email-compatible presentation table', async () => {
    const html = await render(() => <Section>Lorem ipsum</Section>);

    expect(html).toContain('<table align="center" width="100%" border="0"');
    expect(html).toContain('cellpadding="0"');
    expect(html).toContain('cellspacing="0"');
    expect(html).toContain('role="presentation"');
    expect(html).toContain('Lorem ipsum');
  });

  it('splits padding to the inner td and keeps non-padding styles on table', async () => {
    const html = await render(() => (
      <Section style={{ 'background-color': '#fff', padding: '10px' }}>
        Content
      </Section>
    ));

    expect(html).toContain('<table');
    expect(html).toContain('background-color:#fff');
    expect(html).toContain('style="padding:10px"');
    expect(html).not.toContain('backgroundColor');
  });

  it('passes style and data attributes to the table', async () => {
    const html = await render(() => (
      <Section
        class="section-native"
        data-testid="section-test"
        style={{ 'background-color': 'red' }}
      >
        Test
      </Section>
    ));

    expect(html).toContain('style="background-color:red"');
    expect(html).toContain('data-testid="section-test"');
    expect(html).toMatch(/class="section-native\s*"/);
    expect(html).toContain('Test');
  });

  it('normalizes className and camel-case styles while splitting padding', async () => {
    const html = await render(() => (
      <Section
        aria-label="content section"
        className="section"
        style={{ backgroundColor: '#fff', paddingTop: 8 }}
      >
        Test
      </Section>
    ));

    expect(html).toMatch(/class="section\s*"/);
    expect(html).toContain('aria-label="content section"');
    expect(html).toContain('style="background-color:#fff"');
    expect(html).toContain('style="padding-top:8px"');
    expect(html).not.toContain('className');
    expect(html).not.toContain('backgroundColor');
    expect(html).not.toContain('paddingTop');
  });

  it('normalizes native string styles while splitting padding', async () => {
    const html = await render(() => (
      <Section style="background-color:#eee;padding-top:8px">Hi</Section>
    ));

    expect(html).toContain('style="background-color:#eee"');
    expect(html).toContain('style="padding-top:8px"');
    expect(html).toContain('Hi');
  });

  it('wraps all provided children in a single td', async () => {
    const html = await render(() => (
      <Section>
        <div>Lorem ipsum</div>
        <p>Lorem ipsum</p>
        <img alt="Lorem" src="lorem.ipsum" />
      </Section>
    ));

    const tdOpenTags = html.match(/<td/g);
    expect(tdOpenTags).toHaveLength(1);
  });
});
