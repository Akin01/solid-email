import {
  Body,
  Button,
  Column,
  Container,
  Heading,
  Html,
  Img,
  Link,
  Row,
  Section,
  Slot,
  slot,
  Text,
} from '@akin01/solid-email';
import type { JSX } from '@solidjs/web';
import { For } from 'solid-js';
import {
  standardChecklist,
  standardFooterLinks,
  standardLineItems,
  standardTextSections,
} from './text-render-fixture-data';

export type CompiledTextSlots = {
  headline: string;
  name: string;
  intro: JSX.Element;
  ctaHref: string;
  markerLiteral: string;
  skipPreview: boolean;
};

type CompiledTextTemplateProps = {
  headline: JSX.Element;
  name: JSX.Element;
  intro: JSX.Element;
  ctaHref: string;
  markerLiteral: JSX.Element;
  skipPreview: string | boolean;
};

export const compiledTextTemplateProps = {
  headline: Slot({ name: 'headline' }),
  name: Slot({ name: 'name' }),
  intro: Slot({ name: 'intro' }),
  ctaHref: slot('ctaHref'),
  markerLiteral: Slot({ name: 'markerLiteral' }),
  skipPreview: slot('skipPreview'),
} satisfies CompiledTextTemplateProps;

export const compiledTextRenderData = {
  headline: 'Account security summary',
  name: 'Pat',
  intro: (
    <>
      <Text>Keep this digest</Text>
      <Text>
        <strong>handy</strong>
      </Text>
    </>
  ),
  ctaHref: 'mailto:security@example.com',
  markerLiteral: '__SM_CNT_runtime____SM_CNE_runtime__',
  skipPreview: true,
} satisfies CompiledTextSlots;

export function createCompiledTextEmail(props: CompiledTextTemplateProps) {
  return (
    <Html lang="en">
      <Body>
        <Container>
          <Text data-skip-in-text={props.skipPreview}>Preview-only alert</Text>
          <Section>
            <Heading as="h1">{props.headline}</Heading>
            <Text>Hello {props.name}, your digest is ready.</Text>
            {props.intro}
            <Button href="https://example.com/audit">
              Download audit report
            </Button>
            <Text>
              <Link href={props.ctaHref}>Open digest</Link>
            </Text>
            <Text>{props.markerLiteral}</Text>
          </Section>

          <Section>
            <Heading as="h2">Release notes</Heading>
            <For each={standardTextSections}>
              {(section) => (
                <Section>
                  <Heading as="h3">{section.title}</Heading>
                  <Text>{section.body}</Text>
                  <Text>
                    <Link href={section.href}>Read {section.title}</Link>
                  </Text>
                </Section>
              )}
            </For>
          </Section>

          <Section>
            <Heading as="h2">Plan allocation</Heading>
            <For each={standardLineItems}>
              {(item) => (
                <Row>
                  <Column>
                    <Text>{item.name}</Text>
                  </Column>
                  <Column>
                    <Text>Quantity {item.quantity}</Text>
                  </Column>
                  <Column>
                    <Text>{item.total}</Text>
                  </Column>
                </Row>
              )}
            </For>
          </Section>

          <Section>
            <Heading as="h2">Owner checklist</Heading>
            <ol>
              <For each={standardChecklist}>{(item) => <li>{item}</li>}</For>
            </ol>
          </Section>

          <Img src="https://example.com/tracker.gif" alt="Tracking pixel" />
          <Section>
            <For each={standardFooterLinks}>
              {([label, href], index) => (
                <span>
                  {index() > 0 ? ' · ' : ''}
                  <Link href={href}>{label}</Link>
                </span>
              )}
            </For>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
