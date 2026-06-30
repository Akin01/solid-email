/** @jsxRuntime automatic */
/** @jsxImportSource react */
import type { ReactElement, ReactNode } from 'react';
import {
  Mjml,
  MjmlBody,
  MjmlButton,
  MjmlColumn,
  MjmlDivider,
  MjmlFont,
  MjmlHead,
  MjmlImage,
  MjmlPreview,
  MjmlSection,
  MjmlText,
  MjmlWrapper,
} from '@faire/mjml-react';
import {
  features,
  footerLinks,
  marketingProps,
  products,
  updates,
} from '../shared/fixture-data';

export type MjmlMarketingEmailProps = {
  preview?: string;
  headline?: ReactNode;
  intro?: ReactNode;
  ctaHref?: string;
  footerReason?: ReactNode;
};

export function MjmlMarketingEmail(
  props: MjmlMarketingEmailProps = {},
): ReactElement {
  const data = { ...marketingProps, ...props };
  return (
    <Mjml>
      <MjmlHead>
        <MjmlFont
          name="system"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
        />
        <MjmlPreview>{data.preview}</MjmlPreview>
      </MjmlHead>
      <MjmlBody backgroundColor="#f6f9fc" width={640}>
        {/* Container */}
        <MjmlWrapper
          backgroundColor="#ffffff"
          border="1px solid #e5e7eb"
          borderRadius="16px"
          padding="32px"
        >
          {/* Hero */}
          <MjmlSection
            backgroundColor="#111827"
            borderRadius="14px"
            padding="32px"
          >
            <MjmlColumn>
              <MjmlText
                fontSize="32px"
                lineHeight="40px"
                color="#ffffff"
                fontWeight="700"
                margin="0 0 16px"
              >
                {data.headline}
              </MjmlText>
              <MjmlText
                fontSize="16px"
                lineHeight="26px"
                color="#d1d5db"
                margin="0 0 24px"
              >
                {data.intro}
              </MjmlText>
              <MjmlButton
                backgroundColor="#7c3aed"
                borderRadius="8px"
                color="#ffffff"
                fontSize="15px"
                fontWeight="700"
                padding="14px 22px"
                href={data.ctaHref}
              >
                View the launch notes
              </MjmlButton>
            </MjmlColumn>
          </MjmlSection>

          <MjmlDivider borderColor="#e5e7eb" padding="28px 0" />

          {/* Features */}
          <MjmlSection>
            <MjmlColumn>
              <MjmlText
                fontSize="22px"
                lineHeight="30px"
                color="#111827"
                fontWeight="700"
                margin="0 0 16px"
              >
                What this fixture covers
              </MjmlText>
              {features.map((feature) => (
                <MjmlSection
                  key={feature.title}
                  backgroundColor="#f9fafb"
                  border="1px solid #e5e7eb"
                  borderRadius="12px"
                  padding="16px"
                >
                  <MjmlColumn>
                    <MjmlText
                      fontSize="16px"
                      lineHeight="24px"
                      color="#111827"
                      fontWeight="700"
                      margin="0 0 6px"
                    >
                      {feature.title}
                    </MjmlText>
                    <MjmlText
                      fontSize="14px"
                      lineHeight="22px"
                      color="#4b5563"
                      margin="0"
                    >
                      {feature.body}
                    </MjmlText>
                  </MjmlColumn>
                </MjmlSection>
              ))}
            </MjmlColumn>
          </MjmlSection>

          {/* Products */}
          <MjmlSection padding="8px 0">
            <MjmlColumn>
              <MjmlText
                fontSize="22px"
                lineHeight="30px"
                color="#111827"
                fontWeight="700"
                margin="0 0 16px"
              >
                Product highlights
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>
          <MjmlSection>
            {products.map((product) => (
              <MjmlColumn key={product.title} padding="12px">
                <MjmlImage
                  width="72px"
                  height="72px"
                  src={product.image}
                  alt={`${product.title} icon`}
                  borderRadius="14px"
                  padding="0 0 10px"
                />
                <MjmlText
                  fontSize="14px"
                  lineHeight="20px"
                  color="#111827"
                  fontWeight="700"
                  align="center"
                  margin="0"
                >
                  {product.title}
                </MjmlText>
                <MjmlText
                  fontSize="13px"
                  lineHeight="18px"
                  color="#7c3aed"
                  fontWeight="700"
                  align="center"
                  margin="4px 0 0"
                >
                  {product.price}
                </MjmlText>
              </MjmlColumn>
            ))}
          </MjmlSection>

          {/* Release notes */}
          <MjmlSection>
            <MjmlColumn>
              <MjmlText
                fontSize="22px"
                lineHeight="30px"
                color="#111827"
                fontWeight="700"
                margin="0 0 16px"
              >
                Release notes
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>
          {updates.map((update) => (
            <MjmlSection key={update.title}>
              <MjmlColumn width="44px">
                <MjmlText
                  fontSize="12px"
                  lineHeight="28px"
                  color="#6d28d9"
                  fontWeight="700"
                  backgroundColor="#ede9fe"
                  borderRadius="999px"
                  align="center"
                  margin="0"
                >
                  {update.title.split(' ')[2]}
                </MjmlText>
              </MjmlColumn>
              <MjmlColumn>
                <MjmlText
                  fontSize="14px"
                  lineHeight="22px"
                  color="#111827"
                  fontWeight="700"
                  margin="0 0 4px"
                >
                  {update.title}
                </MjmlText>
                <MjmlText
                  fontSize="14px"
                  lineHeight="22px"
                  color="#4b5563"
                  margin="0 0 12px"
                >
                  {update.body}
                </MjmlText>
              </MjmlColumn>
            </MjmlSection>
          ))}

          <MjmlDivider borderColor="#e5e7eb" padding="28px 0" />

          {/* Footer */}
          <MjmlSection>
            <MjmlColumn>
              <MjmlText
                fontSize="12px"
                lineHeight="20px"
                color="#6b7280"
                align="center"
                margin="0 0 8px"
              >
                {data.footerReason}
              </MjmlText>
              <MjmlText
                fontSize="12px"
                lineHeight="20px"
                color="#6b7280"
                align="center"
                margin="0"
              >
                {footerLinks.map(([label, href], index) => (
                  <span key={href}>
                    {index > 0 ? ' · ' : ''}
                    <a href={href} style={{ color: '#6d28d9' }}>
                      {label}
                    </a>
                  </span>
                ))}
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>
        </MjmlWrapper>
      </MjmlBody>
    </Mjml>
  );
}

export const createMjmlMarketingEmail = (
  props?: MjmlMarketingEmailProps,
) => <MjmlMarketingEmail {...props} />;
