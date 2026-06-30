/** @jsxRuntime automatic */
/** @jsxImportSource solid-js */
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@akin01/solid-email';

function makeProps(name: string) {
  return {
    preview: `Preview for ${name}`,
    headline: `Welcome to ${name}`,
    intro: `This is the intro text for ${name}. It contains some details.`,
    ctaHref: `https://example.com/${name}`,
    footerReason: `You received this because you signed up for ${name}.`,
  };
}

export function SimpleTemplate() {
  return (
    <Html lang="en">
      <Head />
      <Preview>Simple email</Preview>
      <Body style={{ margin: 0, padding: 20 }}>
        <Text>Hello from simple template</Text>
      </Body>
    </Html>
  );
}

export function MediumTemplate() {
  const p = makeProps('medium');
  return (
    <Html lang="en">
      <Head />
      <Preview>{p.preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: '#f6f9fc' }}>
        <Container style={{ padding: 32, maxWidth: 600 }}>
          <Section
            style={{
              backgroundColor: '#111827',
              padding: 32,
              borderRadius: 12,
            }}
          >
            <Heading as="h1" style={{ color: '#fff' }}>
              {p.headline}
            </Heading>
            <Text style={{ color: '#d1d5db' }}>{p.intro}</Text>
            <Button
              href={p.ctaHref}
              style={{ backgroundColor: '#7c3aed', color: '#fff' }}
            >
              Get Started
            </Button>
          </Section>
          <Hr style={{ borderColor: '#e5e7eb' }} />
          <Section>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>
              {p.footerReason}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function LargeTemplate() {
  const p = makeProps('large');
  const features = Array.from({ length: 8 }, (_, i) => ({
    title: `Feature ${i + 1}`,
    body: `Description of feature ${i + 1} with some detail text about what it does.`,
  }));
  const products = Array.from({ length: 6 }, (_, i) => ({
    title: `Product ${i + 1}`,
    price: `$${(i + 1) * 29}`,
    image: `https://example.com/product-${i + 1}.png`,
  }));
  const updates = Array.from({ length: 20 }, (_, i) => ({
    title: `Release ${i + 1}`,
    body: `Changelog entry for version ${i + 1} with details about changes.`,
  }));

  return (
    <Html lang="en">
      <Head />
      <Preview>{p.preview}</Preview>
      <Body
        style={{
          margin: 0,
          backgroundColor: '#f6f9fc',
          fontFamily: 'sans-serif',
        }}
      >
        <Container
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            margin: '32px auto',
            padding: 32,
            width: 640,
          }}
        >
          <Section
            style={{
              backgroundColor: '#111827',
              borderRadius: 14,
              color: '#fff',
              padding: 32,
            }}
          >
            <Heading as="h1" style={{ color: '#fff', fontSize: 32 }}>
              {p.headline}
            </Heading>
            <Text style={{ color: '#d1d5db', fontSize: 16 }}>{p.intro}</Text>
            <Button
              href={p.ctaHref}
              style={{
                backgroundColor: '#7c3aed',
                color: '#fff',
                borderRadius: 8,
                padding: '14px 22px',
              }}
            >
              View the launch notes
            </Button>
          </Section>
          <Hr style={{ borderColor: '#e5e7eb', margin: '28px 0' }} />
          <Section>
            <Heading as="h2" style={{ fontSize: 22 }}>
              What this fixture covers
            </Heading>
            {features.map((f) => (
              <Section
                key={f.title}
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  marginBottom: 12,
                  padding: 16,
                }}
              >
                <Heading as="h3" style={{ fontSize: 16 }}>
                  {f.title}
                </Heading>
                <Text style={{ color: '#4b5563', fontSize: 14 }}>{f.body}</Text>
              </Section>
            ))}
          </Section>
          <Section style={{ padding: '8px 0' }}>
            <Heading as="h2" style={{ fontSize: 22 }}>
              Product highlights
            </Heading>
            <Row>
              {products.map((prod) => (
                <Column
                  key={prod.title}
                  style={{ padding: 12, width: '33.333%' }}
                >
                  <Img
                    alt={prod.title}
                    height="72"
                    src={prod.image}
                    style={{
                      borderRadius: 14,
                      display: 'block',
                      margin: '0 auto 10px',
                    }}
                    width="72"
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      textAlign: 'center' as const,
                    }}
                  >
                    {prod.title}
                  </Text>
                  <Text
                    style={{
                      color: '#7c3aed',
                      fontSize: 13,
                      fontWeight: 700,
                      textAlign: 'center' as const,
                    }}
                  >
                    {prod.price}
                  </Text>
                </Column>
              ))}
            </Row>
          </Section>
          <Section>
            <Heading as="h2" style={{ fontSize: 22 }}>
              Release notes
            </Heading>
            {updates.map((u) => (
              <Row key={u.title}>
                <Column style={{ width: 44 }}>
                  <Text
                    style={{
                      backgroundColor: '#ede9fe',
                      borderRadius: 999,
                      color: '#6d28d9',
                      fontSize: 12,
                      fontWeight: 700,
                      textAlign: 'center' as const,
                      width: 28,
                    }}
                  >
                    {u.title.split(' ')[1]}
                  </Text>
                </Column>
                <Column>
                  <Text style={{ fontSize: 14, fontWeight: 700 }}>
                    {u.title}
                  </Text>
                  <Text style={{ color: '#4b5563', fontSize: 14 }}>
                    {u.body}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
          <Hr style={{ borderColor: '#e5e7eb', margin: '28px 0' }} />
          <Section style={{ textAlign: 'center' as const }}>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>
              {p.footerReason}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function getProps(name: string) {
  return makeProps(name);
}
