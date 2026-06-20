import { render } from '@solid-email/render';
import { describe, expect, it } from 'vitest';
import { Head } from '../head';
import { Link } from '../link';
import { pixelBasedPreset, Tailwind } from './tailwind';

describe('Tailwind', () => {
  const headMissingError =
    'Tailwind: <head> not found inside <Tailwind>.\nMove <Head /> inside <Tailwind>, or remove these classes that require a <head>:';

  it('renders children with inline Tailwind styles from Solid class attributes', async () => {
    const html = await render(() => (
      <Tailwind>
        <div class="bg-white text-sm">Hello</div>
      </Tailwind>
    ));

    expect(html).toContain(
      '<div style="background-color:rgb(255,255,255);font-size:0.875rem;line-height:1.4285714285714286">Hello</div>',
    );
    expect(html).not.toContain('class="bg-white text-sm"');
  });

  it('lets explicit styles override generated styles', async () => {
    const html = await render(() => (
      <Tailwind>
        <div class="text-blue-600" style={{ color: 'red' }}>
          Text
        </div>
      </Tailwind>
    ));

    expect(html).toContain(
      '<div style="color:rgb(21,93,252);color:red">Text</div>',
    );
  });

  it("doesn't generate styles from text content", async () => {
    const html = await render(() => (
      <Tailwind>container bg-red-500 bg-blue-300</Tailwind>
    ));

    expect(html).toContain('container bg-red-500 bg-blue-300');
    expect(html).not.toContain('style=');
  });

  it('preserves unknown classes and removes inlined classes on links', async () => {
    const html = await render(() => (
      <Tailwind>
        <Link
          class="other text-blue-600 no-underline"
          href="https://solidjs.com"
        >
          Solid
        </Link>
      </Tailwind>
    ));

    expect(html).toContain('class="other"');
    expect(html).toContain(
      'style="color:rgb(21,93,252);text-decoration-line:none;color:#067df7;text-decoration-line:none"',
    );
  });

  it('inserts non-inline styles into the first head element', async () => {
    const html = await render(() => (
      <Tailwind>
        <Head />
        <body>
          <div class="md:p-4">Responsive</div>
        </body>
      </Tailwind>
    ));

    expect(html).toContain('<style>');
    expect(html).toContain('@media (min-width:48rem)');
    expect(html).toContain('.md_p-4{padding:1rem!important}');
    expect(html).toContain('class="md_p-4"');
  });

  it('throws when non-inline styles require a head element', async () => {
    await expect(
      render(() => (
        <Tailwind>
          <div class="md:p-4">Responsive</div>
        </Tailwind>
      )),
    ).rejects.toThrow(headMissingError);
  });

  it('supports custom theme and utility CSS inputs', async () => {
    const html = await render(() => (
      <Tailwind
        theme="@theme { --color-brand: #123456; }"
        utility={`
          .text-brand {
            color: var(--color-brand);
          }
        `}
      >
        <p class="text-brand">Brand</p>
      </Tailwind>
    ));

    expect(html).toContain('<p style="color:rgb(18,52,86)">Brand</p>');
  });

  it('exposes the pixel-based preset used by email spacing and font sizes', () => {
    expect(pixelBasedPreset.theme?.extend).toMatchObject({
      fontSize: {
        sm: ['14px', { lineHeight: '20px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
      },
      spacing: {
        4: '16px',
        96: '384px',
      },
    });
  });
});
