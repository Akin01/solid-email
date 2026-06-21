---
name: solid-email
description: Use when building, reviewing, testing, or documenting HTML email templates with Solid Email. Covers SolidJS email components, server rendering to HTML or plain text, compile-based template caching with slots, Tailwind inlining, markdown, code highlighting, Vite/TanStack integration, and email-client-safe styling.
license: MIT
metadata:
  author: Solid Email contributors
  version: "0.1.2"
  homepage: https://github.com/akin01/solid-email
  source: https://github.com/akin01/solid-email
---

# Solid Email

Build HTML emails using SolidJS components and server-side rendering.

Use this skill when the task involves:

- Creating transactional or marketing email templates with SolidJS.
- Rendering Solid email components to HTML or plain text.
- Using `@akin01/solid-email` components such as `Html`, `Body`, `Container`, `Button`, `Tailwind`, `Markdown`, or `CodeBlock`.
- Integrating email rendering into Vite, TanStack Start, server functions, workers, or Node scripts.
- Reviewing email markup for client-safe structure, inline styles, and TypeScript safety.

## Install

```sh
pnpm add @akin01/solid-email @solid-email/render solid-js
```

## Basic template

```tsx
import { Body, Button, Container, Head, Html, Preview, Text } from '@akin01/solid-email';

interface WelcomeEmailProps {
  name: string;
  actionUrl: string;
}

export function WelcomeEmail(props: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to the product</Preview>
      <Body style={{ 'background-color': '#f6f9fc', margin: '0' }}>
        <Container style={{ margin: '0 auto', padding: '32px 24px' }}>
          <Text>Hello {props.name},</Text>
          <Text>Thanks for signing up.</Text>
          <Button href={props.actionUrl}>Get started</Button>
        </Container>
      </Body>
    </Html>
  );
}
```

## Render to HTML

```tsx
import { render } from '@solid-email/render';
import { WelcomeEmail } from './welcome-email';

const html = await render(() => (
  <WelcomeEmail name="Ainul" actionUrl="https://example.com/start" />
));
```

Use `render()` for the default path. It supports async Solid rendering and `pretty: true`.

Use `renderSync()` only for static templates that do not need async resources, Suspense waiting, or pretty formatting.

```tsx
import { renderSync } from '@solid-email/render';

const html = renderSync(() => (
  <WelcomeEmail name="Ainul" actionUrl="https://example.com/start" />
));
```

## Compile for repeated renders

When the same template is rendered multiple times with different data, `compile()` pre-evaluates the Solid components once and reuses the cached HTML on each render.

```tsx
import { compile, Slot, slot } from '@solid-email/render';
import { Body, Button, Container, Html, Text } from '@akin01/solid-email';

function WelcomeEmail() {
  return (
    <Html>
      <Body>
        <Container>
          <Text>
            Hello <Slot name="name" />!
          </Text>
          <Button href={slot('actionUrl')}>Get started</Button>
        </Container>
      </Body>
    </Html>
  );
}

const compiled = await compile(() => <WelcomeEmail />);

const html = await compiled.render({ name: 'Alice', actionUrl: 'https://example.com/start' });
const html2 = await compiled.render({ name: 'Bob', actionUrl: 'https://other.com' });
```

Slots mark dynamic parts of a compiled template:

```tsx
import { compile, Slot, slot } from '@solid-email/render';

const compiled = await compile(
  <p>
    Hello <Slot name="name" />!
    <a href={slot('url')}>Visit</a>
  </p>,
);

const html = await compiled.render({ name: 'Alice', url: 'https://example.com' });
```

Content slots accept string, number, boolean, null, undefined, JSX, and arrays.
Attribute slots accept only string, number, boolean, null, and undefined; passing
JSX, objects, or arrays to an attribute slot throws. Use `<Slot />` for
JSX/content values.

For typed slot names, use `defineSlots<T>()`:

```tsx
import { compile, defineSlots } from '@solid-email/render';

type MySlots = { name: string; url: string };
const slots = defineSlots<MySlots>();

const compiled = await compile<MySlots>(
  <p>
    {slots.content('name', 'Guest')}
    <a href={slots.attr('url')}>Visit</a>
  </p>,
);
```

Pass slot markers through props when adapting existing prop-driven components:

```tsx
import type { JSX } from 'solid-js';
import { compile, Slot, slot } from '@solid-email/render';

function Button(props: { href: string; children: JSX.Element }) {
  return <a href={props.href}>{props.children}</a>;
}

function WelcomeEmail(props: { name: JSX.Element; actionUrl: string }) {
  return (
    <p>
      Hello {props.name}! <Button href={props.actionUrl}>Open dashboard</Button>
    </p>
  );
}

const compiled = await compile(
  <WelcomeEmail name={<Slot name="name" />} actionUrl={slot('actionUrl')} />,
);

const html = await compiled.render({
  name: 'Alice',
  actionUrl: 'https://example.com/dashboard',
});
```

Tailwind classes must be on static parent elements, not on Slot components. Slot values at runtime use inline styles or fall back to `render()`.

## Plain text

```tsx
const text = await render(() => <WelcomeEmail name="Ainul" actionUrl="https://example.com/start" />, {
  plainText: true,
});
```

## Component rules

- Use `Html`, `Head`, `Preview`, and `Body` for every complete email.
- Put `Preview` near the top of the email tree so inbox preview text is generated reliably.
- Use `Container`, `Section`, `Row`, and `Column` for layout instead of flexbox or grid.
- Use `Button` for call-to-action links, not a native `<button>`.
- Use `Img` with absolute production URLs, meaningful `alt`, and explicit dimensions when known.
- Use `Hr` for dividers and specify border style when overriding borders.
- Use `Markdown` only for trusted markdown strings or strings sanitized before rendering.
- Use `CodeInline` and `CodeBlock` for code content; specify a Prism language for code blocks when possible.
- Use `Tailwind` when utility classes should be compiled and inlined for email clients.

## SolidJS prop conventions

Solid Email uses SolidJS attributes by default.

- Prefer `class`, not `className`.
- Prefer kebab-case style keys: `{ 'background-color': '#fff' }`.
- `style` can be a Solid CSS object, a practical loose style object, or a CSS string.
- Native HTML/email attributes should serialize as native attributes.
- Keep props typed. Do not use `@ts-nocheck`, `@ts-ignore`, broad `any`, or fake fallbacks.

## Styling rules

- Inline important styles. Many email clients strip or limit stylesheet rules.
- Prefer table-based layout through components.
- Avoid flexbox, grid, complex selectors, custom interactive CSS, and JavaScript.
- Use pixel values for critical spacing and dimensions.
- Avoid relying on media queries for core layout behavior.
- Avoid SVG and WEBP for broad email-client support; prefer PNG or JPG.
- Always define production asset URLs before shipping templates.

See [references/STYLING.md](references/STYLING.md) for more styling guidance.

## Tailwind

```tsx
import { Body, Container, Html, Tailwind, Text } from '@akin01/solid-email';

export function TailwindEmail() {
  return (
    <Html>
      <Tailwind>
        <Body class="bg-slate-50">
          <Container class="mx-auto p-6">
            <Text class="text-base text-slate-900">Hello.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

Tailwind compiles utility classes, inlines eligible CSS, preserves required residual classes for non-inlineable rules, and injects remaining CSS into `Head`.

## Sending

Solid Email returns ordinary HTML. Send that HTML with any provider that accepts an HTML body.

```tsx
const html = await render(() => <WelcomeEmail name="Ainul" actionUrl="https://example.com/start" />);

await emailProvider.send({
  to: 'user@example.com',
  subject: 'Welcome',
  html,
});
```

See [references/SENDING.md](references/SENDING.md) for provider examples.


## Before writing an email template

Ask for missing production details when they affect correctness:

1. Brand colors and typography.
2. Logo/image files and production asset host.
3. Email provider and sending constraints.
4. Target clients if compatibility is strict.
5. Required plain-text fallback.

## Verification

For package or template changes, run the smallest useful checks:

```sh
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm lint
```

For a single package, prefer filtered commands when available.

## References

- [Components](references/COMPONENTS.md)
- [Styling](references/STYLING.md)
- [Rendering](references/RENDERING.md)
- [Sending](references/SENDING.md)
- [Testing](references/TESTING.md)
