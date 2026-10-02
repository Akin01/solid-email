import type { JSX } from '@solidjs/web';
import { HydrationScript } from '@solidjs/web';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/solid-router';
import { Loading } from 'solid-js';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent(): JSX.Element {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument(props: Readonly<{ children: JSX.Element }>): JSX.Element {
  return (
    <html lang="en">
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <Loading>{props.children}</Loading>
        <Scripts />
      </body>
    </html>
  );
}
