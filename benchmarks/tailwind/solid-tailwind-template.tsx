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
  Tailwind,
  Text,
} from '@akin01/solid-email';
import { For } from 'solid-js';
import {
  campaign,
  features,
  footerLinks,
  products,
  updates,
} from '../rendering/fixture-data';

export function SolidTailwindEmail() {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            fontFamily: {
              email:
                '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
            },
          },
        },
      }}
    >
      <Html lang="en">
        <Head />
        <Preview>{campaign.preview}</Preview>
        <Body class="m-0 bg-[#f6f9fc] font-email text-[#1f2937]">
          <Container class="mx-auto my-8 w-[640px] rounded-2xl border border-solid border-[#e5e7eb] bg-white p-8 md:p-10">
            <Section class="rounded-[14px] bg-[#111827] p-8 text-white">
              <Heading
                as="h1"
                class="m-0 mb-4 text-[32px] leading-[40px] text-white"
              >
                {campaign.headline}
              </Heading>
              <Text class="m-0 mb-6 text-base leading-[26px] text-[#d1d5db]">
                {campaign.intro}
              </Text>
              <Button
                class="rounded-lg bg-[#7c3aed] px-[22px] py-[14px] text-[15px] font-bold text-white no-underline"
                href={campaign.ctaHref}
              >
                {campaign.ctaLabel}
              </Button>
            </Section>

            <Hr class="my-7 border-[#e5e7eb]" />

            <Section>
              <Heading
                as="h2"
                class="m-0 mb-4 text-[22px] leading-[30px] text-[#111827]"
              >
                Tailwind fixture coverage
              </Heading>
              <For each={features}>
                {(feature) => (
                  <Section class="mb-3 rounded-xl border border-solid border-[#e5e7eb] bg-[#f9fafb] p-4">
                    <Heading
                      as="h3"
                      class="m-0 mb-[6px] text-base leading-6 text-[#111827]"
                    >
                      {feature.title}
                    </Heading>
                    <Text class="m-0 mb-3 text-sm leading-[22px] text-[#4b5563]">
                      {feature.body}
                    </Text>
                  </Section>
                )}
              </For>
            </Section>

            <Section class="py-2">
              <Heading
                as="h2"
                class="m-0 mb-4 text-[22px] leading-[30px] text-[#111827]"
              >
                Product highlights
              </Heading>
              <Row>
                <For each={products}>
                  {(product) => (
                    <Column class="w-1/3 p-3 text-center">
                      <Img
                        alt={`${product.title} icon`}
                        class="mx-auto mb-[10px] block rounded-[14px]"
                        height="72"
                        src={product.image}
                        width="72"
                      />
                      <Text class="m-0 text-center text-sm font-bold leading-5 text-[#111827]">
                        {product.title}
                      </Text>
                      <Text class="m-0 mt-1 text-center text-[13px] font-bold leading-[18px] text-[#7c3aed]">
                        {product.price}
                      </Text>
                    </Column>
                  )}
                </For>
              </Row>
            </Section>

            <Section>
              <Heading
                as="h2"
                class="m-0 mb-4 text-[22px] leading-[30px] text-[#111827]"
              >
                Release notes
              </Heading>
              <For each={updates}>
                {(update) => (
                  <Row>
                    <Column class="w-11">
                      <Text class="m-0 w-7 rounded-full bg-[#ede9fe] text-center text-xs font-bold leading-7 text-[#6d28d9]">
                        {update.title.split(' ')[2]}
                      </Text>
                    </Column>
                    <Column>
                      <Text class="m-0 mb-1 text-sm font-bold leading-[22px] text-[#111827]">
                        {update.title}
                      </Text>
                      <Text class="m-0 mb-3 text-sm leading-[22px] text-[#4b5563]">
                        {update.body}
                      </Text>
                    </Column>
                  </Row>
                )}
              </For>
            </Section>

            <Hr class="my-7 border-[#e5e7eb]" />

            <Section class="text-center">
              <Text class="m-0 mb-2 text-xs leading-5 text-[#6b7280]">
                You are receiving this benchmark email because rendering speed
                is being measured.
              </Text>
              <Text class="m-0 mb-2 text-xs leading-5 text-[#6b7280]">
                <For each={footerLinks}>
                  {([label, href], index) => (
                    <span>
                      {index() > 0 ? ' · ' : ''}
                      <Link class="text-[#6d28d9] underline" href={href}>
                        {label}
                      </Link>
                    </span>
                  )}
                </For>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export const createSolidTailwindEmail = () => <SolidTailwindEmail />;
