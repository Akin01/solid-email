import {
  render as renderSolidEmail,
  renderSync as renderSolidEmailSync,
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
import { createReactMarketingEmail } from './react-email-template';
import { createReactTailwindEmail } from './react-tailwind-template';
import { createSolidMarketingEmail } from './solid-email-template';

const solidSyncHtml = renderSolidEmailSync(createSolidMarketingEmail);
const [solidAsyncHtml, solidTailwindHtml, reactHtml, reactTailwindHtml] =
  await Promise.all([
    renderSolidEmail(createSolidMarketingEmail),
    renderSolidEmail(createSolidTailwindEmail),
    renderReactEmail(createReactMarketingEmail()),
    renderReactEmail(createReactTailwindEmail()),
  ]);

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

logFixtureBytes({
  'solid-email renderSync': Buffer.byteLength(solidSyncHtml),
  'solid-email render': Buffer.byteLength(solidAsyncHtml),
  'solid-email render with Tailwind': Buffer.byteLength(solidTailwindHtml),
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
      const html = renderSolidEmailSync(createSolidMarketingEmail);
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email render async API static template',
    async () => {
      const html = await renderSolidEmail(createSolidMarketingEmail);
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email render async API Tailwind template',
    async () => {
      const html = await renderSolidEmail(createSolidTailwindEmail);
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'react-email render',
    async () => {
      const html = await renderReactEmail(createReactMarketingEmail());
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'react-email render Tailwind template',
    async () => {
      const html = await renderReactEmail(createReactTailwindEmail());
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
