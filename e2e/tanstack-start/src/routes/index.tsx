import { createFileRoute } from '@tanstack/solid-router';
import { renderFixtureEmailStatus } from '../email.functions';

export const Route = createFileRoute('/')({
  loader: () => renderFixtureEmailStatus(),
  component: Home,
});

function Home() {
  const status = Route.useLoaderData();
  return <main data-email-status={status()}>TanStack Start Solid email</main>;
}
