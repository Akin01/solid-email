import {
  Body,
  Button,
  CodeBlock,
  CodeInline,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Markdown,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  xonokai,
} from '@akin01/solid-email';

const markdownContent = `# Markdown heading

Paragraph with **bold text**, _italic text_, ~~removed text~~, and [a markdown link](https://example.com/markdown).

> Quoted markdown block

1. First ordered item
2. Second ordered item

- First unordered item
- Second unordered item

| Name | Value |
| ---- | ----- |
| Component | Markdown |

![Markdown image](https://example.com/markdown.png "Markdown image title")

\`inline markdown code\`

\`\`\`ts
const answer = 42;
\`\`\`
`;

export function AllComponentsEmail() {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <Font
          fallbackFontFamily={['Arial', 'sans-serif']}
          fontFamily="InterFixture"
          fontStyle="normal"
          fontWeight={400}
          webFont={{
            format: 'woff2',
            url: 'https://example.com/inter-fixture.woff2',
          }}
        />
      </Head>
      <Preview>All components e2e preview</Preview>
      <Body
        style={{
          'background-color': '#f6f9fc',
          margin: '0',
          padding: '24px',
        }}
      >
        <Tailwind>
          <Container class="mx-auto bg-white p-4" data-e2e="container">
            <Section
              class="rounded-lg border border-solid border-slate-200"
              style={{ padding: '16px' }}
            >
              <Heading
                as="h1"
                class="text-xl font-bold text-slate-900"
                mb="8px"
              >
                Comprehensive components e2e
              </Heading>
              <Text
                class="text-sm text-blue-600"
                style={{ margin: '0 0 12px' }}
              >
                TanStack Start Solid email
              </Text>
              <Hr style={{ 'border-color': '#e2e8f0', margin: '16px 0' }} />
              <Row>
                <Column class="w-1/2" data-e2e="left-column">
                  <Img
                    alt="Solid Email fixture logo"
                    height="40"
                    src="https://example.com/logo.png"
                    width="120"
                  />
                </Column>
                <Column class="w-1/2 text-right" data-e2e="right-column">
                  <Link href="https://example.com/link">
                    Plain link component
                  </Link>
                </Column>
              </Row>
              <Button
                class="rounded bg-blue-600 px-4 py-2 text-white"
                href="https://example.com/action"
                style={{ padding: '12px 16px' }}
              >
                Button component
              </Button>
              <Text>
                Inline code component:{' '}
                <CodeInline>const solid = true;</CodeInline>
              </Text>
              <CodeBlock
                code={
                  'function greet(name: string) {\n  return "Hello " + name;\n}'
                }
                fontFamily="Menlo, monospace"
                language="typescript"
                lineNumbers
                theme={xonokai}
              />
              <Markdown
                class="markdown-fixture"
                markdownContainerStyles={{
                  border: '1px solid #e2e8f0',
                  padding: '12px',
                }}
              >
                {markdownContent}
              </Markdown>
            </Section>
          </Container>
        </Tailwind>
      </Body>
    </Html>
  );
}
