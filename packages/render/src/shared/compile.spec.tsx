import { describe, expect, it, vi } from 'vitest';
import { compile, compileSync } from './compile';
import { Slot, slot } from './slots';

describe('compile', () => {
  it('compiles and renders a content slot with string value', async () => {
    const email = await compile(
      <p>
        Hello <Slot name="name" />!
      </p>,
    );
    const html = await email.render({ name: 'Alice' });
    expect(html).toContain('Hello Alice!');
    expect(html).not.toContain('__SM_CNT_');
    expect(html).not.toContain('__SM_CNE_');
  });

  it('compiles and renders an attribute slot', async () => {
    const email = await compile(<a href={slot('url')}>Click</a>);
    const html = await email.render({ url: 'https://example.com' });
    expect(html).toContain('href="https://example.com"');
    expect(html).not.toContain('__SM_ATR_');
  });

  it('preserves default content when slot data is omitted', async () => {
    const email = await compile(
      <p>
        <Slot name="greeting">Hello</Slot> World
      </p>,
    );
    // biome-ignore lint/suspicious/noExplicitAny: testing missing slot data
    const html = await email.render({} as any);
    expect(html).toContain('Hello World');
    expect(html).not.toContain('__SM_CNT_');
    expect(html).not.toContain('__SM_CNE_');
  });

  it('replaces content slot with empty string when no default and no data', async () => {
    const email = await compile(
      <p>
        <Slot name="name" />!
      </p>,
    );
    // biome-ignore lint/suspicious/noExplicitAny: testing missing slot data
    const html = await email.render({} as any);
    expect(html).toContain('<!');
    expect(html).not.toContain('__SM_CNT_');
  });

  it('escapes HTML in string slot values', async () => {
    const email = await compile(
      <p>
        <Slot name="text" />
      </p>,
    );
    const html = await email.render({ text: '<script>alert("xss")</script>' });
    expect(html).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('handles multiple slots of the same name', async () => {
    const email = await compile(
      <p>
        <Slot name="word" /> <Slot name="word" />
      </p>,
    );
    const html = await email.render({ word: 'hi' });
    expect(html).toContain('hi hi');
  });

  it('handles mixed content and attribute slots', async () => {
    const url = slot('url');
    const email = await compile(
      <a href={url} aria-label="Navigate to link">
        <Slot name="label">link</Slot>
      </a>,
    );
    const html = await email.render({ url: '/path' });
    expect(html).toContain('href="/path"');
    expect(html).toContain('link');
  });

  it('ignores extra keys in data', async () => {
    const email = await compile(
      <p>
        <Slot name="name" />
      </p>,
    );
    // biome-ignore lint/suspicious/noExplicitAny: testing extra key ignored
    const html = await email.render({ name: 'Alice', extra: 'ignored' } as any);
    expect(html).toContain('Alice');
  });

  it('accepts null and renders empty', async () => {
    const email = await compile(
      <p>
        <Slot name="x" />
      </p>,
    );
    // biome-ignore lint/suspicious/noExplicitAny: testing null slot value
    const html = await email.render({ x: null } as any);
    expect(html).toContain('<p></p>');
    expect(html).not.toMatch(/__SM_/);
  });

  it('applies doctype wrapper like render', async () => {
    const email = await compile(<div>content</div>);
    // biome-ignore lint/suspicious/noExplicitAny: testing empty slot data
    const html = await email.render({} as any);
    expect(html).toContain('<!DOCTYPE html PUBLIC');
    expect(html).toContain('<div>content</div>');
  });

  it('returns plain text when plainText option is set', async () => {
    const email = await compile(
      <div>
        <Slot name="msg" />
      </div>,
    );
    const text = await email.render(
      { msg: 'Hello World' },
      { plainText: true },
    );
    expect(text).toContain('Hello World');
    expect(text).not.toContain('<!DOCTYPE');
    expect(text).not.toContain('<div>');
  });

  it('returns pretty HTML when pretty option is set', async () => {
    const email = await compile(
      <div>
        <p>
          <Slot name="msg" />
        </p>
      </div>,
    );
    const html = await email.render({ msg: 'Hello' }, { pretty: true });
    expect(html).toContain('\n');
  });

  it('renders number slot values', async () => {
    const email = await compile(
      <p>
        <Slot name="count" />
      </p>,
    );
    const html = await email.render({ count: 42 });
    expect(html).toContain('42');
  });

  it('renders boolean true slot value', async () => {
    const email = await compile(
      <p>
        <Slot name="flag" />
      </p>,
    );
    const html = await email.render({ flag: true });
    expect(html).toContain('true');
  });

  it('renders boolean false slot value as empty', async () => {
    const email = await compile(
      <p>
        <Slot name="flag" />
      </p>,
    );
    const html = await email.render({ flag: false });
    expect(html).not.toContain('true');
  });

  it('preserves rendered html with slot markers stripped', async () => {
    const email = await compile(
      <p>
        <Slot name="name" />
      </p>,
    );
    const html = await email.render({ name: 'Bob' });
    expect(html).not.toMatch(/__SM_/);
  });

  it('supports defineSlots API for typed slots', async () => {
    const { content: cnt } = (await import('./slots')).defineSlots<{
      title: string;
    }>();
    // Just verify the function returns markers correctly
    expect(cnt('title')).toContain('__SM_CNT_');
    expect(cnt('title')).toContain('__SM_CNE_');
    expect(cnt('title', 'default')).toContain('default');
  });

  it('does not process marker-like text introduced by slot values', async () => {
    const email = await compile(
      <div>
        <p>
          <Slot name="body" />
        </p>
        <a href={slot('url')}>Click</a>
      </div>,
    );
    const html = await email.render({
      body: slot('url'),
      url: 'https://example.com',
    });
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('Click</a>');
  });

  it('renders array slot values without Solid separator comments', async () => {
    const email = await compile(
      <p>
        <Slot name="items" />
      </p>,
    );
    const html = await email.render({ items: ['a', '<b>', 3] });
    expect(html).toContain('<p>a&lt;b&gt;3</p>');
    expect(html).not.toContain('<!--!$-->');
  });

  it('preserves numeric zero as default content', async () => {
    const email = await compile(
      <p>
        <Slot name="count">{0}</Slot>
      </p>,
    );
    // biome-ignore lint/suspicious/noExplicitAny: testing empty slot data
    const html = await email.render({} as any);
    expect(html).toContain('<p>0</p>');
    expect(html).not.toContain('__SM_CNT_');
  });
});

describe('compileSync', () => {
  it('compiles and renders synchronously', async () => {
    const email = compileSync(
      <p>
        <Slot name="name" />
      </p>,
    );
    const html = email.renderSync({ name: 'sync' });
    expect(html).toContain('sync');
    expect(html).toContain('<!DOCTYPE html PUBLIC');
  });

  it('rejects pretty option', () => {
    const email = compileSync(<p>static</p>);
    // biome-ignore lint/suspicious/noExplicitAny: testing error path with invalid options
    expect(() => email.renderSync({} as any, { pretty: true } as any)).toThrow(
      'renderSync does not support pretty output',
    );
  });

  it('rejects pretty option saved during async compile', async () => {
    const email = await compile(<p>static</p>, { pretty: true });
    // biome-ignore lint/suspicious/noExplicitAny: testing error path
    expect(() => email.renderSync({} as any)).toThrow(
      'renderSync does not support pretty output',
    );
  });

  it('renders plain text synchronously', () => {
    const email = compileSync(
      <div>
        <Slot name="msg" />
      </div>,
    );
    const text = email.renderSync({ msg: 'Hello' }, { plainText: true });
    expect(text).toBe('Hello');
  });
});

describe('slot utilities', () => {
  it('slot() creates attribute markers', () => {
    const marker = slot('url');
    expect(marker).toContain('__SM_ATR_');
    expect(marker).toContain('url');
  });

  it('slot() encodes special characters', () => {
    const marker = slot('my slot');
    expect(marker).toContain('my%20slot');
  });
});

describe('runtime guards', () => {
  it('warns when content slot has no default and no data', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const email = await compile(
      <p>
        <Slot name="name" />
      </p>,
    );
    await email.render({});
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Slot "name" has no default'),
    );
    warn.mockRestore();
  });

  it('does not warn when content slot has a default', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const email = await compile(
      <p>
        <Slot name="name">fallback</Slot>
      </p>,
    );
    await email.render({});
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('does not warn when slot data is provided', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const email = await compile(
      <p>
        <Slot name="name" />
      </p>,
    );
    await email.render({ name: 'Alice' });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
