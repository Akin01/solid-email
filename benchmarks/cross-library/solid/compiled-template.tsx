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
  Link,
  Preview,
  Row,
  Section,
  Slot,
  slot,
  Text,
} from '@akin01/solid-email';
import {
  features,
  footerLinks,
  products,
  updates,
} from '../shared/fixture-data';

export function CompiledMarketingEmail() {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        <Slot name="preview" />
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.hero}>
            <Heading as="h1" style={styles.heading}>
              <Slot name="headline" />
            </Heading>
            <Text style={styles.intro}>
              <Slot name="intro" />
            </Text>
            <Button href={slot('ctaHref')} style={styles.button}>
              View the launch notes
            </Button>
          </Section>

          <Hr style={styles.rule} />

          <Section>
            <Heading as="h2" style={styles.sectionHeading}>
              What this fixture covers
            </Heading>
            {features.map((feature) => (
              <Section key={feature.title} style={styles.card}>
                <Heading as="h3" style={styles.cardTitle}>
                  {feature.title}
                </Heading>
                <Text style={styles.copy}>{feature.body}</Text>
              </Section>
            ))}
          </Section>

          <Section style={styles.productSection}>
            <Heading as="h2" style={styles.sectionHeading}>
              Product highlights
            </Heading>
            <Row>
              {products.map((product) => (
                <Column key={product.title} style={styles.productColumn}>
                  <Img
                    alt={`${product.title} icon`}
                    height="72"
                    src={product.image}
                    style={styles.productImage}
                    width="72"
                  />
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                </Column>
              ))}
            </Row>
          </Section>

          <Section>
            <Heading as="h2" style={styles.sectionHeading}>
              Release notes
            </Heading>
            {updates.map((update) => (
              <Row key={update.title}>
                <Column style={styles.updateIndexColumn}>
                  <Text style={styles.updateIndex}>
                    {update.title.split(' ')[2]}
                  </Text>
                </Column>
                <Column>
                  <Text style={styles.updateTitle}>{update.title}</Text>
                  <Text style={styles.copy}>{update.body}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={styles.rule} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              <Slot name="footerReason" />
            </Text>
            <Text style={styles.footerText}>
              {footerLinks.map(([label, href], index) => (
                <span key={href}>
                  {index > 0 ? ' · ' : ''}
                  <Link href={href} style={styles.footerLink}>
                    {label}
                  </Link>
                </span>
              ))}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    color: '#1f2937',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    margin: 0,
  },
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    margin: '32px auto',
    padding: '32px',
    width: '640px',
  },
  hero: {
    backgroundColor: '#111827',
    borderRadius: '14px',
    color: '#ffffff',
    padding: '32px',
  },
  heading: {
    color: '#ffffff',
    fontSize: '32px',
    lineHeight: '40px',
    margin: '0 0 16px',
  },
  intro: {
    color: '#d1d5db',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '0 0 24px',
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    padding: '14px 22px',
  },
  rule: {
    borderColor: '#e5e7eb',
    margin: '28px 0',
  },
  sectionHeading: {
    color: '#111827',
    fontSize: '22px',
    lineHeight: '30px',
    margin: '0 0 16px',
  },
  card: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    marginBottom: '12px',
    padding: '16px',
  },
  cardTitle: {
    color: '#111827',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 6px',
  },
  copy: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 12px',
  },
  productSection: {
    padding: '8px 0',
  },
  productColumn: {
    padding: '12px',
    width: '33.333%',
  },
  productImage: {
    borderRadius: '14px',
    display: 'block',
    margin: '0 auto 10px',
  },
  productTitle: {
    color: '#111827',
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '20px',
    margin: '0',
    textAlign: 'center',
  },
  productPrice: {
    color: '#7c3aed',
    fontSize: '13px',
    fontWeight: 700,
    lineHeight: '18px',
    margin: '4px 0 0',
    textAlign: 'center',
  },
  updateIndexColumn: {
    width: '44px',
  },
  updateIndex: {
    backgroundColor: '#ede9fe',
    borderRadius: '999px',
    color: '#6d28d9',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: '28px',
    margin: '0',
    textAlign: 'center',
    width: '28px',
  },
  updateTitle: {
    color: '#111827',
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '22px',
    margin: '0 0 4px',
  },
  footer: {
    textAlign: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: '12px',
    lineHeight: '20px',
    margin: '0 0 8px',
  },
  footerLink: {
    color: '#6d28d9',
    textDecoration: 'underline',
  },
} as const;
