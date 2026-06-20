import { generate } from 'css-tree';
import { describe, expect, it } from 'vitest';
import { setupTailwind } from './setup-tailwind';

describe('setupTailwind', () => {
  it('builds utilities and updates the generated stylesheet', async () => {
    const { addUtilities, getStyleSheet } = await setupTailwind({});

    addUtilities(['text-red-500', 'sm:bg-blue-300', 'bg-slate-900']);
    const firstCss = generate(getStyleSheet());

    expect(firstCss).toContain('.text-red-500{color:var(--color-red-500)}');
    expect(firstCss).toContain(
      '.sm\\:bg-blue-300{@media (width>=40rem){background-color:var(--color-blue-300)}}',
    );

    addUtilities(['bg-red-100']);
    const secondCss = generate(getStyleSheet());

    expect(secondCss).toContain(
      '.bg-red-100{background-color:var(--color-red-100)}',
    );
    expect(secondCss).toContain('.text-red-500{color:var(--color-red-500)}');
  });

  it('reuses compiler setup without sharing utility state', async () => {
    const first = await setupTailwind({});
    first.addUtilities(['text-red-500']);

    const second = await setupTailwind({});
    second.addUtilities(['bg-blue-500']);
    const secondCss = generate(second.getStyleSheet());

    expect(secondCss).toContain(
      '.bg-blue-500{background-color:var(--color-blue-500)}',
    );
    expect(secondCss).not.toContain(
      '.text-red-500{color:var(--color-red-500)}',
    );
  });

  it('throws on legacy positional config shape', async () => {
    await expect(
      setupTailwind({ plugins: [], theme: { extend: {} } }),
    ).rejects.toThrow(/setupTailwind now takes \{ config, cssConfigs \}/);
  });
});
