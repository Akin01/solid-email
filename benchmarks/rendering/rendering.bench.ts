import {
  compile as compileSolidEmail,
  compileSync as compileSolidEmailSync,
  render as renderSolidEmail,
  renderSync as renderSolidEmailSync,
  Slot,
  slot,
} from '@akin01/solid-email';
import { render as renderReactEmail } from 'react-email';
import { afterAll, bench, describe } from 'vitest';
import { createSolidTailwindEmail } from '../tailwind/solid-tailwind-template';
import {
  assertIncludes,
  iterationBenchmarkOptions,
  logBenchmarkSettings,
  logFixtureBytes,
} from '../utils';
import { marketingProps } from './fixture-data';
import { createReactMarketingEmail } from './react-email-template';
import { createReactTailwindEmail } from './react-tailwind-template';
import { createSolidMarketingEmail } from './solid-email-template';

const solidMarketingSlotProps = {
  headline: Slot({ name: 'headline' }),
  ctaHref: slot('ctaHref'),
  footerReason: Slot({ name: 'footerReason' }),
};
const solidMarketingRenderData = {
  headline: marketingProps.headline,
  ctaHref: marketingProps.ctaHref,
  footerReason: marketingProps.footerReason,
};

const solidSyncHtml = renderSolidEmailSync(() =>
  createSolidMarketingEmail(marketingProps),
);
const [solidAsyncHtml, solidTailwindHtml, reactHtml, reactTailwindHtml] =
  await Promise.all([
    renderSolidEmail(() => createSolidMarketingEmail(marketingProps)),
    renderSolidEmail(() => createSolidTailwindEmail(marketingProps)),
    renderReactEmail(createReactMarketingEmail(marketingProps)),
    renderReactEmail(createReactTailwindEmail(marketingProps)),
  ]);

const compiledSync = compileSolidEmailSync(() =>
  createSolidMarketingEmail(solidMarketingSlotProps),
);
const compiledAsync = await compileSolidEmail(() =>
  createSolidMarketingEmail(solidMarketingSlotProps),
);
const compiledSyncRender = compiledSync.renderSync(solidMarketingRenderData);
const compiledAsyncRender = await compiledAsync.render(
  solidMarketingRenderData,
);

const compiledTailwindAsync = await compileSolidEmail(() =>
  createSolidTailwindEmail(solidMarketingSlotProps),
);
const compiledTailwindAsyncRender = await compiledTailwindAsync.render(
  solidMarketingRenderData,
);

assertIncludes('solid-email renderSync', solidSyncHtml, [
  'Launch Week',
  'Product highlights',
  'Release note 12',
  'View the launch notes',
]);
assertIncludes('solid-email render', solidAsyncHtml, [
  'Launch Week',
  'Product highlights',
  'Release note 12',
  'View the launch notes',
]);
assertIncludes('solid-email render with Tailwind', solidTailwindHtml, [
  'Launch Week',
  'Tailwind fixture coverage',
  'Release note 12',
  'View the launch notes',
]);
assertIncludes('react-email', reactHtml, [
  'Launch Week',
  'Product highlights',
  'Release note 12',
  'View the launch notes',
]);
assertIncludes('react-email render with Tailwind', reactTailwindHtml, [
  'Launch Week',
  'Tailwind fixture coverage',
  'Release note 12',
  'View the launch notes',
]);
assertIncludes('solid-email compileSync render', compiledSyncRender, [
  'Launch Week',
  'Product highlights',
  'Release note 12',
  'View the launch notes',
]);
assertIncludes('solid-email compile render', compiledAsyncRender, [
  'Launch Week',
  'Product highlights',
  'Release note 12',
  'View the launch notes',
]);
assertIncludes(
  'solid-email compile render Tailwind',
  compiledTailwindAsyncRender,
  [
    'Launch Week',
    'Tailwind fixture coverage',
    'Release note 12',
    'View the launch notes',
  ],
);

logFixtureBytes({
  'solid-email renderSync': Buffer.byteLength(solidSyncHtml),
  'solid-email render': Buffer.byteLength(solidAsyncHtml),
  'solid-email render with Tailwind': Buffer.byteLength(solidTailwindHtml),
  'solid-email compileSync render': Buffer.byteLength(compiledSyncRender),
  'solid-email compile render': Buffer.byteLength(compiledAsyncRender),
  'solid-email compile render Tailwind': Buffer.byteLength(
    compiledTailwindAsyncRender,
  ),
  'react-email render': Buffer.byteLength(reactHtml),
  'react-email render with Tailwind': Buffer.byteLength(reactTailwindHtml),
});
const options = iterationBenchmarkOptions();
logBenchmarkSettings(options);

let renderedBytes = 0;

describe('email rendering use cases', () => {
  bench(
    'solid-email renderSync static template',
    () => {
      const html = renderSolidEmailSync(() =>
        createSolidMarketingEmail(marketingProps),
      );
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email render async API static template',
    async () => {
      const html = await renderSolidEmail(() =>
        createSolidMarketingEmail(marketingProps),
      );
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email render async API Tailwind template',
    async () => {
      const html = await renderSolidEmail(() =>
        createSolidTailwindEmail(marketingProps),
      );
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email compileSync render (cached)',
    () => {
      const html = compiledSync.renderSync(solidMarketingRenderData);
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email compile render (cached)',
    async () => {
      const html = await compiledAsync.render(solidMarketingRenderData);
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email compile render Tailwind (cached)',
    async () => {
      const html = await compiledTailwindAsync.render(solidMarketingRenderData);
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email compileSync one-time compile + render',
    () => {
      const tpl = compileSolidEmailSync(() =>
        createSolidMarketingEmail(solidMarketingSlotProps),
      );
      const html = tpl.renderSync(solidMarketingRenderData);
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email compile one-time compile + render',
    async () => {
      const tpl = await compileSolidEmail(() =>
        createSolidMarketingEmail(solidMarketingSlotProps),
      );
      const html = await tpl.render(solidMarketingRenderData);
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'react-email render',
    async () => {
      const html = await renderReactEmail(
        createReactMarketingEmail(marketingProps),
      );
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'react-email render Tailwind template',
    async () => {
      const html = await renderReactEmail(
        createReactTailwindEmail(marketingProps),
      );
      renderedBytes += html.length;
    },
    options,
  );
});

afterAll(() => {
  if (renderedBytes === 0) {
    throw new Error('Benchmark did not render any output');
  }
});
