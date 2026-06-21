import {
  render as renderSolidEmail,
  renderSync as renderSolidEmailSync,
} from '@akin01/solid-email';
import { afterAll, bench, describe } from 'vitest';
import { createSolidMarketingEmail } from '../rendering/solid-email-template';
import {
  assertIncludes,
  iterationBenchmarkOptions,
  logBenchmarkSettings,
  logFixtureBytes,
} from '../utils';
import { createSolidTailwindEmail } from './solid-tailwind-template';

const expectedContent = [
  'Launch Week',
  'Tailwind fixture coverage',
  'Release note 12',
  'View the launch notes',
];
const options = iterationBenchmarkOptions();
const solidInlineHtml = renderSolidEmailSync(createSolidMarketingEmail);
const solidTailwindHtml = await renderSolidEmail(createSolidTailwindEmail);

assertIncludes('solid-email inline', solidInlineHtml, [
  'Launch Week',
  'Product highlights',
  'Release note 12',
  'View the launch notes',
]);
assertIncludes('solid-email tailwind', solidTailwindHtml, expectedContent);

logFixtureBytes({
  'solid-email without tailwind': Buffer.byteLength(solidInlineHtml),
  'solid-email with tailwind': Buffer.byteLength(solidTailwindHtml),
});
logBenchmarkSettings(options);

let renderedBytes = 0;

describe('tailwind vs inline email rendering', () => {
  bench(
    'solid-email without tailwind',
    () => {
      const html = renderSolidEmailSync(createSolidMarketingEmail);
      renderedBytes += html.length;
    },
    options,
  );

  bench(
    'solid-email with tailwind',
    async () => {
      const html = await renderSolidEmail(createSolidTailwindEmail);
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
