import { createServerFn } from '@tanstack/solid-start';
import { renderFixtureEmail } from './email.server';

export const renderFixtureEmailStatus = createServerFn({
  method: 'GET',
}).handler(async () => {
  const html = await renderFixtureEmail();
  return html.includes('TanStack Start Solid email') ? 'rendered' : 'missing';
});
