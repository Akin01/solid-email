/** @jsxRuntime automatic */
/** @jsxImportSource react */
import type { ReactElement, ReactNode } from 'react';
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
} from 'react-email';
import {
  features,
  footerLinks,
  marketingProps,
  products,
  updates,
} from './fixture-data';

export type ReactTailwindEmailProps = {
  preview?: string;
  headline?: ReactNode;
  intro?: ReactNode;
  ctaHref?: string;
  footerReason?: ReactNode;
};

export function ReactTailwindEmail(
  props: ReactTailwindEmailProps = {},
): ReactElement {
  const data = { ...marketingProps, ...props };
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
        <Preview>{data.preview}</Preview>
        <Body className="m-0 bg-[#f6f9fc] font-email text-[#1f2937]">
          <Container className="mx-auto my-8 w-[640px] rounded-2xl border border-solid border-[#e5e7eb] bg-white p-8 md:p-10">
            <Section className="rounded-[14px] bg-[#111827] p-8 text-white">
              <Heading
                as="h1"
                className="m-0 mb-4 text-[32px] leading-[40px] text-white"
              >
                {data.headline}
              </Heading>
              <Text className="m-0 mb-6 text-base leading-[26px] text-[#d1d5db]">
                {data.intro}
              </Text>
              <Button
                className="rounded-lg bg-[#7c3aed] px-[22px] py-[14px] text-[15px] font-bold text-white no-underline"
                href={data.ctaHref}
              >
                View the launch notes
              </Button>
            </Section>

            <Hr className="my-7 border-[#e5e7eb]" />

            <Section>
              <Heading
                as="h2"
                className="m-0 mb-4 text-[22px] leading-[30px] text-[#111827]"
              >
                Tailwind fixture coverage
              </Heading>
              {features.map((feature) => (
                <Section
                  className="mb-3 rounded-xl border border-solid border-[#e5e7eb] bg-[#f9fafb] p-4"
                  key={feature.title}
                >
                  <Heading
                    as="h3"
                    className="m-0 mb-[6px] text-base leading-6 text-[#111827]"
                  >
                    {feature.title}
                  </Heading>
                  <Text className="m-0 mb-3 text-sm leading-[22px] text-[#4b5563]">
                    {feature.body}
                  </Text>
                </Section>
              ))}
            </Section>

            <Section className="py-2">
              <Heading
                as="h2"
                className="m-0 mb-4 text-[22px] leading-[30px] text-[#111827]"
              >
                Product highlights
              </Heading>
              <Row>
                {products.map((product) => (
                  <Column className="w-1/3 p-3 text-center" key={product.title}>
                    <Img
                      alt={`${product.title} icon`}
                      className="mx-auto mb-[10px] block rounded-[14px]"
                      height="72"
                      src={product.image}
                      width="72"
                    />
                    <Text className="m-0 text-center text-sm font-bold leading-5 text-[#111827]">
                      {product.title}
                    </Text>
                    <Text className="m-0 mt-1 text-center text-[13px] font-bold leading-[18px] text-[#7c3aed]">
                      {product.price}
                    </Text>
                  </Column>
                ))}
              </Row>
            </Section>

            <Section>
              <Heading
                as="h2"
                className="m-0 mb-4 text-[22px] leading-[30px] text-[#111827]"
              >
                Release notes
              </Heading>
              {updates.map((update) => (
                <Row key={update.title}>
                  <Column className="w-11">
                    <Text className="m-0 w-7 rounded-full bg-[#ede9fe] text-center text-xs font-bold leading-7 text-[#6d28d9]">
                      {update.title.split(' ')[2]}
                    </Text>
                  </Column>
                  <Column>
                    <Text className="m-0 mb-1 text-sm font-bold leading-[22px] text-[#111827]">
                      {update.title}
                    </Text>
                    <Text className="m-0 mb-3 text-sm leading-[22px] text-[#4b5563]">
                      {update.body}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr className="my-7 border-[#e5e7eb]" />

            <Section className="text-center">
              <Text className="m-0 mb-2 text-xs leading-5 text-[#6b7280]">
                {data.footerReason}
              </Text>
              <Text className="m-0 mb-2 text-xs leading-5 text-[#6b7280]">
                {footerLinks.map(([label, href], index) => (
                  <span key={href}>
                    {index > 0 ? ' · ' : ''}
                    <Link className="text-[#6d28d9] underline" href={href}>
                      {label}
                    </Link>
                  </span>
                ))}
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export const createReactTailwindEmail = (props?: ReactTailwindEmailProps) => (
  <ReactTailwindEmail {...props} />
);
