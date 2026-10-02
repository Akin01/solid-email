# @solid-email/render

Render SolidJS email templates to HTML or plain text, and compile templates for repeated renders with slots.

## Install

```sh
pnpm add @solid-email/render solid-js @solidjs/web
```

Install `@akin01/solid-email` when using the Solid Email component set.

```sh
pnpm add @akin01/solid-email
```

## Render HTML

```tsx
import { Body, Button, Container, Html, Text } from '@akin01/solid-email';
import { render } from '@solid-email/render';

const html = await render(() => (
  <Html>
    <Body>
      <Container>
        <Text>Welcome to Solid Email.</Text>
        <Button href="https://example.com">Get started</Button>
      </Container>
    </Body>
  </Html>
));
```

## Render plain text

```tsx
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

## Compile repeated renders

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

const html = await compiled.render({ name: 'Alice', url: 'https://example.com/dashboard' });
const text = await compiled.render(
  { name: 'Alice', url: 'https://example.com/dashboard' },
  { plainText: true },
);
```

Use `renderSync()` and `compileSync()` only for static templates that do not need async Solid rendering or `pretty` output.

See the repository README for benchmarks and advanced usage: https://github.com/Akin01/solid-email
