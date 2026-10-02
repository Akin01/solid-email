import type { JSX } from '@solidjs/web';
import { describe, expect, it } from 'vitest';
import {
  render as browserRender,
  renderSync as browserRenderSync,
} from './browser';
import { render as edgeRender, renderSync as edgeRenderSync } from './edge';
import { render as nodeRender, renderSync as nodeRenderSync } from './node';

function Throwing(): JSX.Element {
  throw new Error('entrypoint failure');
}

const entrypoints = [
  { name: 'browser', render: browserRender, renderSync: browserRenderSync },
  { name: 'edge', render: edgeRender, renderSync: edgeRenderSync },
  { name: 'node', render: nodeRender, renderSync: nodeRenderSync },
] as const;

describe('render entrypoints', () => {
  for (const entrypoint of entrypoints) {
    it(`renders Solid JSX through the ${entrypoint.name} entrypoint`, async () => {
      const html = await entrypoint.render(() => <p>Hello from entrypoint</p>);

      expect(html).toContain('<!DOCTYPE html PUBLIC');
      expect(html).toContain('<p>Hello from entrypoint</p>');
    });

    it(`renders Solid JSX synchronously through the ${entrypoint.name} entrypoint`, () => {
      const html = entrypoint.renderSync(() => <p>Hello sync entrypoint</p>);

      expect(html).toContain('<!DOCTYPE html PUBLIC');
      expect(html).toContain('<p>Hello sync entrypoint</p>');
    });

    it(`converts Solid JSX with plainText through the ${entrypoint.name} entrypoint`, async () => {
      const text = await entrypoint.render(
        () => (
          <div>
            Hello <strong>plain text</strong>
            <img alt="hidden" src="image.png" />
            <span data-skip-in-text="true">skip me</span>
            <a href="https://example.com">https://example.com</a>
          </div>
        ),
        { plainText: true },
      );

      expect(text).toContain('Hello plain text');
      expect(text).not.toContain('DOCTYPE');
      expect(text).not.toContain('hidden');
      expect(text).not.toContain('skip me');
      expect(text.match(/https:\/\/example\.com/g)).toHaveLength(1);
    });

    it(`converts Solid JSX with sync plainText through the ${entrypoint.name} entrypoint`, () => {
      const text = entrypoint.renderSync(
        () => (
          <div>
            Hello <strong>sync plain text</strong>
            <img alt="hidden" src="image.png" />
            <span data-skip-in-text="true">skip me</span>
            <a href="https://example.com">https://example.com</a>
          </div>
        ),
        { plainText: true },
      );

      expect(text).toContain('Hello sync plain text');
      expect(text).not.toContain('DOCTYPE');
      expect(text).not.toContain('hidden');
      expect(text).not.toContain('skip me');
      expect(text.match(/https:\/\/example\.com/g)).toHaveLength(1);
    });

    it(`pretties html through the ${entrypoint.name} entrypoint`, async () => {
      const html = await entrypoint.render(
        () => (
          <div>
            <span>Pretty entrypoint</span>
          </div>
        ),
        { pretty: true },
      );

      expect(html).toContain('<!DOCTYPE html PUBLIC');
      expect(html).toContain('\n');
      expect(html).toContain('<div><span>Pretty entrypoint</span></div>');
    });

    it(`rejects Solid component render errors through the ${entrypoint.name} entrypoint`, async () => {
      await expect(entrypoint.render(() => <Throwing />)).rejects.toThrow(
        'entrypoint failure',
      );
    });
  }
});
