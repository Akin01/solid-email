import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Img } from './img';

describe('Img', () => {
  it('renders email-compatible defaults', async () => {
    const html = await render(() => (
      <Img src="cat.jpg" width="300" height="300" />
    ));

    expect(html).toContain('<img');
    expect(html).toContain('src="cat.jpg"');
    expect(html).toContain('alt=""');
    expect(html).toContain('width="300"');
    expect(html).toContain('height="300"');
    expect(html).toContain('display:block');
    expect(html).toContain('outline:none');
    expect(html).toContain('border:none');
    expect(html).toContain('text-decoration:none');
  });

  it('preserves alt and explicit style overrides', async () => {
    const html = await render(() => (
      <Img
        src="cat.jpg"
        alt="Cat"
        style={{ display: 'inline', border: '1px solid red' }}
      />
    ));

    expect(html).toContain('alt="Cat"');
    expect(html).toContain('display:inline');
    expect(html).toContain('border:1px solid red');
  });

  it('passes style and data attributes', async () => {
    const html = await render(() => (
      <Img
        alt="Cat"
        data-testid="img-test"
        height="300"
        src="cat.jpg"
        style={{ 'background-color': 'red', border: 'solid 1px black' }}
        width="300"
      />
    ));

    expect(html).toContain('background-color:red');
    expect(html).toContain('border:solid 1px black');
    expect(html).toContain('data-testid="img-test"');
  });

  it('emits native class output from the Solid class prop', async () => {
    const html = await render(() => (
      <Img class="photo" src="cat.jpg" alt="Cat" />
    ));

    expect(html).toMatch(/class="photo\s*"/);
    expect(html).not.toContain('className');
  });

  it('normalizes alternate class and camel-case styles while forwarding image attrs', async () => {
    const html = await render(() => (
      <Img
        alt="Cat"
        className="photo"
        loading="lazy"
        src="cat.jpg"
        style={{ objectFit: 'cover' }}
      />
    ));

    expect(html).toMatch(/class="photo\s*"/);
    expect(html).toContain('alt="Cat"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('object-fit:cover');
    expect(html).not.toContain('className');
    expect(html).not.toContain('objectFit');
  });
});
