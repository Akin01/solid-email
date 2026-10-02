<table align="center">
  <tr>
    <td valign="middle">
      <img src="assets/solid-email-logo.png" alt="Solid Email logo" width="128" />
    </td>
    <td valign="middle">
      <h1>Solid Email</h1>
    </td>
  </tr>
</table>

<div align="center">
  Build beautiful, reliable HTML emails with SolidJS.
  <br />
  High-quality, unstyled components for modern email templates.
</div>

## Introduction

Solid Email is a collection of email components for SolidJS and TypeScript.
It helps you write responsive templates with familiar JSX while handling the markup patterns email clients expect.

Inspired by [React Email](https://react.email), designed for SolidJS.

## Why

Email HTML is still full of client-specific behavior, table layouts, inline styles, and rendering quirks.
Solid Email keeps the authoring experience close to a modern Solid app while producing HTML that can be sent by any email provider.

## Benchmarks

Measured with `pnpm benchmark:rendering` on the repository marketing email fixture. Lower mean time is better.

| Renderer | Template | v1 Mean | v2 Mean | v2 Throughput | Comparison (vs React Email) |
| --- | --- | ---: | ---: | ---: | --- |
| Solid Email `compileSync` (cached) | Static JSX | 0.0438ms | **0.0386ms** | **25,927 hz** | **294x faster** |
| Solid Email `compile` Tailwind (cached) | Tailwind JSX | 0.0452ms | **0.0506ms** | **19,773 hz** | **385x faster** |
| Solid Email `compile` (cached) | Static JSX | 0.0858ms | **0.0520ms** | **19,240 hz** | **218x faster** |
| Solid Email `renderSync()` | Static JSX | 1.8935ms | **1.2689ms** | **788.08 hz** | **8.95x faster** |
| Solid Email `render()` | Static JSX | 2.2919ms | **1.9760ms** | **506.06 hz** | **5.75x faster** |
| Solid Email `render()` | Tailwind JSX | 3.1230ms | **2.4926ms** | **401.19 hz** | **7.82x faster** |
| React Email `render()` | Static JSX | 11.5084ms | 10.2234ms | 97.81 hz | Baseline |
| React Email `render()` | Tailwind JSX | 17.7760ms | 16.8971ms | 59.18 hz | Tailwind baseline |

**Cached** means the template is compiled once and only the render step is measured. This is the expected production usage — compile at module load, render per request. The "one-time" compile+render cost is comparable to calling `render()` directly.

Plain-text benchmarks measured with `pnpm benchmark:html-to-text` on the repository HTML-to-text fixtures. Lower mean time is better.

| Operation | Fixture | v1 Mean | v2 Mean | v2 Throughput | Comparison (vs React Email) |
| --- | --- | ---: | ---: | ---: | --- |
| `@solid-email/render` `toPlainText` | HTML fixtures | 2.4369ms | **1.7383ms** | **575.29 hz** | **3.58x faster** |
| `@solid-email/render` compiled text template | Solid JSX | 1.4434ms | **0.2913ms** | **3,432.87 hz** | **189x faster** |
| `@solid-email/render` uncompiled `renderSync` | Solid JSX | 2.8895ms | **3.3323ms** | **300.10 hz** | **3.48x faster** |
| `@solid-email/html-to-text` `convert` | HTML fixtures | 3.9657ms | **1.6586ms** | **602.91 hz** | **5.56x faster** |
| `html-to-text` `convert` | HTML fixtures | 3.8166ms | 3.6168ms | 276.48 hz | Direct converter baseline |
| React Email `toPlainText` | HTML fixtures | 8.2867ms | 6.2313ms | 160.48 hz | React text conversion baseline |
| React Email `render` plain text | React JSX | 12.4310ms | 10.7571ms | 92.96 hz | React plain-text render baseline |

Cross-library benchmarks measured with `pnpm benchmark:cross-library` on the
marketing email template, using 50 iterations × 10 runs after 3 warmup runs.
Lower average time is better.

| Library / mode | v1 Avg | v2 Avg | Min | Max | Ops/s | Output | Heap Δ | Conformance | vs React Email |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Solid Email `compileSync` (cached) | 12µs | **20µs** | **17µs** | **27µs** | **49,108** | 23.2 KB | **0.50 MB** | 100% | **125.8x faster** |
| Solid Email `renderSync` | 1.17ms | **645µs** | **501µs** | **897µs** | **1,551** | 22.4 KB | **0.56 MB** | 100% | **4.0x faster** |
| React Email `render` | 1.78ms | 3.31ms | 1.84ms | 7.99ms | 302 | 22.3 KB | 26.51 MB | 100% | Baseline |
| JSX Email `render` | 3.82ms | 5.13ms | 4.43ms | 7.18ms | 195 | **18.2 KB** | 1.38 MB | 100% | 1.5x slower |
| MJML React `render` | 11.01ms | 11.84ms | 10.16ms | 14.80ms | 84 | 75.5 KB | 1.65 MB | 100% | 3.6x slower |

All cross-library outputs reached 100% pairwise conformance against the shared
email template checks.

Bundle size compares built ESM entry files after `pnpm build`; gzip uses Node's `zlib.gzipSync`.

| Package entry | v1 Raw (Gzip) | v2 Raw (Gzip) | Comparison |
| --- | ---: | ---: | --- |
| `@solid-email/render/dist/node/index.mjs` | 26.3 KiB (6.2 KiB) | **26.7 KiB (6.2 KiB)** | Dedicated node/server renderer entry |
| `@akin01/solid-email/dist/client/index.mjs` | 105.9 KiB (19.5 KiB) | 106.3 KiB (19.5 KiB) | Browser-condition DOM preview build |
| `@akin01/solid-email/dist/index.mjs` | 199.0 KiB (42.7 KiB) | 203.0 KiB (43.3 KiB) | Server/root components and render utility re-exports |
| `@solid-email/render/dist/browser/index.mjs` | — | 197.4 KiB (45.2 KiB) | Standalone browser renderer entry (new in v2) |
| Solid Email server entries combined | 225.3 KiB (48.9 KiB) | 229.7 KiB (49.5 KiB) | **4.8x smaller raw / 6.8x smaller gzip than React Email** |
| `react-email` distribution total | 1,448.0 KiB (348.6 KiB) | 1,110.0 KiB (334.7 KiB) | React Email baseline |

## Install

```sh
pnpm add @akin01/solid-email @solid-email/render solid-js @solidjs/web
```

## Getting started

Define an email template with SolidJS components.

```tsx
import { Body, Button, Container, Html, Text } from '@akin01/solid-email';

export function WelcomeEmail() {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Welcome to Solid Email.</Text>
          <Button href="https://example.com">Get started</Button>
        </Container>
      </Body>
    </Html>
  );
}
```

Render it to HTML before sending.

```tsx
import { render } from '@solid-email/render';
import { WelcomeEmail } from './welcome-email';

const html = await render(() => <WelcomeEmail />);
```

For static templates that do not use async resources or pretty formatting, use the synchronous renderer.

```tsx
import { renderSync } from '@solid-email/render';
import { WelcomeEmail } from './welcome-email';

const html = renderSync(() => <WelcomeEmail />);
```

## Entrypoints

`@akin01/solid-email` is conditionally exported. Server, Workerd, and default
imports expose `render`, `compile`, and the full email component set, including
`Tailwind`.

Browser-condition imports of the same package root resolve to the DOM/CSR
preview build. That build exports DOM-safe preview components and intentionally
excludes `render`, `compile`, and `Tailwind`.

## Compile for repeated renders

When you render the same template multiple times with different data, `compile()` pre-evaluates the Solid components once and reuses the cached HTML on each render.

```tsx
import { compile, Slot, slot } from '@solid-email/render';
import { Html, Body, Container, Text } from '@akin01/solid-email';

function WelcomeEmail() {
  return (
    <Html>
      <Body>
        <Container>
          <Text>
            Hello <Slot name="name" />!
          </Text>
          <a href={slot('url')}>Visit</a>
        </Container>
      </Body>
    </Html>
  );
}

const compiled = await compile(() => <WelcomeEmail />);

const html = await compiled.render({ name: 'Alice', url: 'https://example.com' });
const html2 = await compiled.render({ name: 'Bob', url: 'https://other.com' });
```

Use `compileSync()` for the synchronous equivalent (rejects `pretty` output).

### Compile plain-text output

For repeated plain-text bodies, compile the template with `withPlainText: true`. The compiled template keeps a reusable text representation, so each render only substitutes slot values.

```tsx
import { Body, Button, Container, Html, Text } from '@akin01/solid-email';
import { compile, Slot, slot } from '@solid-email/render';

const compiled = await compile(
  <Html>
    <Body>
      <Container>
        <Text>
          Hello <Slot name="name" />!
        </Text>
        <Button href={slot('url')}>Open dashboard</Button>
      </Container>
    </Body>
  </Html>,
  { withPlainText: true },
);

const text = await compiled.render(
  { name: 'Alice', url: 'https://example.com/dashboard' },
  { plainText: true },
);
```

For one-off Solid JSX to plain-text output, render the template with `plainText: true`.

```tsx
import { Body, Button, Container, Html, Text } from '@akin01/solid-email';
import { render } from '@solid-email/render';

const text = await render(
  () => (
    <Html>
      <Body>
        <Container>
          <Text>Hello Alice</Text>
          <Button href="https://example.com/dashboard">Open dashboard</Button>
        </Container>
      </Body>
    </Html>
  ),
  { plainText: true },
);
```

### Slots

Slots mark the dynamic parts of a compiled template.

| API | Use case |
| --- | --- |
| `<Slot name="..." />` | Content slot inside JSX elements. |
| `slot("...")` | Attribute slot for attribute values like `href` or `src`. |
| `defineSlots<T>()` | Strongly typed slot names for editor autocomplete. |
| `CompiledTemplate.render(data)` | Re-render the template with new slot values. |
| `CompiledTemplate.renderSync(data)` | Synchronous re-render (no `pretty`). |

Content slots accept string, number, boolean, null, undefined, JSX, and arrays.
Attribute slots accept only string, number, boolean, null, and undefined; passing
JSX, objects, or arrays to an attribute slot throws so broken links and images do
not silently ship. Use `<Slot name="..." />` for JSX/content values.

#### Weak types (untyped slots)

Slot names are plain strings — quick to write but no compile-time checking.

```tsx
import { compile, Slot, slot } from '@solid-email/render';

const compiled = await compile(
  <p>
    Hello <Slot name="name" />!
  </p>
);

// Slot names are strings, typos are silent
const html = await compiled.render({ name: 'Alice' });
```

#### Strong types (defineSlots)

`defineSlots<T>()` returns typed accessor functions so typos and missing keys are caught at compile time.

```tsx
import { compile, defineSlots } from '@solid-email/render';

type MySlots = {
  name: string;
  url: string;
};

const slots = defineSlots<MySlots>();

const compiled = await compile<MySlots>(
  <p>
    Hello {slots.content('name')}!
    <a href={slots.attr('url')}>Visit</a>
  </p>,
);

// TypeScript errors if you miss a key or misspell a name
const html = await compiled.render({ name: 'Alice', url: 'https://example.com' });
```

Content slots support defaults via the second argument: `slots.content('name', 'Guest')`.

#### Slots as props

Pass slot markers through component props when adapting existing prop-driven
components. Props passed to `compile()` are template-time values, so pass
`<Slot />` or `slot()` as the prop value for data that changes per render.

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
  <WelcomeEmail name={<Slot name="name" />} actionUrl={slot('url')} />,
);

const html = await compiled.render({
  name: 'Alice',
  url: 'https://example.com/dashboard',
});
```

### Tailwind with compiled templates

Tailwind classes must be on static parent elements, not on Slot components. Slot values at runtime use inline styles or fall back to `render()`.

## Components

A set of standard components for building email layouts without hand-writing every table and client-safe style.

- [Html](packages/solid-email/src/components/html)
- [Head](packages/solid-email/src/components/head)
- [Font](packages/solid-email/src/components/font)
- [Preview](packages/solid-email/src/components/preview)
- [Body](packages/solid-email/src/components/body)
- [Container](packages/solid-email/src/components/container)
- [Section](packages/solid-email/src/components/section)
- [Row](packages/solid-email/src/components/row)
- [Column](packages/solid-email/src/components/column)
- [Heading](packages/solid-email/src/components/heading)
- [Text](packages/solid-email/src/components/text)
- [Hr](packages/solid-email/src/components/hr)
- [Img](packages/solid-email/src/components/img)
- [Link](packages/solid-email/src/components/link)
- [Button](packages/solid-email/src/components/button)
- [CodeInline](packages/solid-email/src/components/code-inline)
- [CodeBlock](packages/solid-email/src/components/code-block)
- [Markdown](packages/solid-email/src/components/markdown)
- [Tailwind](packages/solid-email/src/components/tailwind)

## Sending email

The renderer returns ordinary HTML, so templates can be sent with any provider that accepts an HTML body.

```tsx
const html = await render(() => <WelcomeEmail />);

await emailProvider.send({
  to: 'user@example.com',
  subject: 'Welcome',
  html,
});
```

## Support

Solid Email targets the common HTML and CSS constraints used by popular email clients.
Always preview important templates in the clients your audience uses.

| <img src="https://react.email/static/icons/gmail.svg" width="48" height="48" alt="Gmail logo" /> | <img src="https://react.email/static/icons/apple-mail.svg" width="48" height="48" alt="Apple Mail logo" /> | <img src="https://react.email/static/icons/outlook.svg" width="48" height="48" alt="Outlook logo" /> | <img src="https://react.email/static/icons/yahoo-mail.svg" width="48" height="48" alt="Yahoo Mail logo" /> | <img src="https://react.email/static/icons/hey.svg" width="48" height="48" alt="HEY logo" /> | <img src="https://react.email/static/icons/superhuman.svg" width="48" height="48" alt="Superhuman logo" /> |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Gmail ✔ | Apple Mail ✔ | Outlook ✔ | Yahoo Mail ✔ | HEY ✔ | Superhuman ✔ |

## Agent skill

Solid Email includes an agent skill for template authoring, rendering, styling, and testing guidance.

```sh
npx skills add akin01/solid-email@solid-email
```

The skill source lives in [`skills/solid-email`](skills/solid-email).

## Development

This repository uses pnpm workspaces and Biome.

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm lint
```

---

<div align="center">
  Build with ❤️ MIT License.
</div>
