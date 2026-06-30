export const campaign = {
  preview: 'Launch Week starts now: ship faster with dependable email.',
  headline: 'Launch Week: reliable transactional email at scale',
  intro:
    'Benchmark fixture for a realistic marketing email with nested layout, links, images, buttons, and repeated content blocks.',
  ctaHref: 'https://example.com/launch-week',
  ctaLabel: 'View the launch notes',
};

export const marketingProps = {
  preview: campaign.preview,
  headline: campaign.headline,
  intro: campaign.intro,
  ctaHref: campaign.ctaHref,
  ctaLabel: campaign.ctaLabel,
  footerReason:
    'You are receiving this benchmark email because rendering speed is being measured.',
};

export const features = [
  {
    title: 'Composable components',
    body: 'Build nested email sections with reusable primitives and inline-safe styles.',
  },
  {
    title: 'Renderer coverage',
    body: 'Exercise document wrappers, preview text, links, images, rows, columns, and button markup.',
  },
  {
    title: 'Production-shaped output',
    body: 'Keep the fixture large enough to expose serializer overhead without relying on external services.',
  },
  {
    title: 'Stable benchmark data',
    body: 'Use deterministic content so repeated runs compare renderer behavior instead of data generation.',
  },
];

export const updates = Array.from({ length: 12 }, (_, index) => ({
  title: `Release note ${index + 1}`,
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
}));

export const products = [
  {
    title: 'Core renderer',
    price: '$29',
    image: 'https://example.com/assets/core-renderer.png',
  },
  {
    title: 'Template kit',
    price: '$49',
    image: 'https://example.com/assets/template-kit.png',
  },
  {
    title: 'Enterprise audit',
    price: '$199',
    image: 'https://example.com/assets/enterprise-audit.png',
  },
];

export const footerLinks = [
  ['Documentation', 'https://example.com/docs'],
  ['Changelog', 'https://example.com/changelog'],
  ['Support', 'https://example.com/support'],
] as const;
