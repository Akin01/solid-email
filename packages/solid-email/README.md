# @akin01/solid-email

High-quality SolidJS components for building HTML email templates.

## Install

```sh
pnpm add @akin01/solid-email @solid-email/render solid-js @solidjs/web
```

## Example

```tsx
import { Body, Button, Container, Html, Text } from '@akin01/solid-email';
import { render } from '@solid-email/render';

function WelcomeEmail() {
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

const html = await render(() => <WelcomeEmail />);
```

## Entrypoints

`@akin01/solid-email` is conditionally exported. Server, Workerd, and default
imports expose `render`, `compile`, and the full email component set, including
`Tailwind`.

Browser-condition imports of the same package root resolve to the DOM/CSR
preview build. That build exports DOM-safe preview components and intentionally
excludes `render`, `compile`, and `Tailwind`.

## Components

Includes email-safe primitives such as `Html`, `Head`, `Preview`, `Body`, `Container`, `Section`, `Row`, `Column`, `Text`, `Heading`, `Button`, `Link`, `Img`, `Hr`, `Markdown`, `CodeInline`, `CodeBlock`, and `Tailwind`.

See the repository README for benchmarks, compiled template examples, and delivery guidance: https://github.com/Akin01/solid-email
