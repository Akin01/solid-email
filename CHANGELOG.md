# Changelog

All notable changes to this project will be documented in this file.

## 0.1.2 - 2026-06-21

### Added

- Added `compile()` and `compileSync()` APIs for pre-rendering reusable email templates and replacing dynamic slot data without re-running Solid SSR for every send.
- Added `Slot`, `slot()`, and `defineSlots<T>()` helpers for content slots, attribute slots, defaults, JSX slot values, and typed slot-name authoring.
- Added compile rendering benchmarks and expanded Solid Email skill documentation for cached template rendering.

### Changed

- Re-exported the compile and slot APIs from `@akin01/solid-email` so component consumers can import them from the package root.
- Bumped monorepo package, fixture tarball, and Solid Email skill versions to `0.1.2`.

### Related

- PR #2: `feat: add compile API for cached template rendering`
- Commit: [`513bc0f701b8`](https://github.com/Akin01/solid-email/commit/513bc0f701b87b1638ce501afcdb2583f47f39f2)

### Verified

- `pnpm --filter @solid-email/render run test`
- `pnpm lint`
- `pnpm typecheck`

## 0.1.1 - 2026-06-21

### Changed

- Improved Solid email render performance by avoiding accidental `children` prop serialization and reducing repeated prop/style work in common components.
- Improved Tailwind render performance with cached render plans, faster class scanning, and lower-allocation inline style serialization.

### Added

- Added rendering benchmarks for Solid Tailwind and React Email Tailwind templates.
- Added regression coverage for filtering Solid children out of native attribute props.

### Verified

- `pnpm --filter @benchmarks/rendering run typecheck`
- `pnpm --filter @akin01/solid-email run test`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm benchmark:rendering`
- `pnpm benchmark:tailwind`

## 0.1.0 - 2026-06-20

### Added

- Added `@akin01/solid-email`, a SolidJS component package for building HTML email templates.
- Added `@solid-email/render`, a Solid SSR renderer for email HTML and plain-text output.
- Added email components: `Html`, `Head`, `Font`, `Preview`, `Body`, `Tailwind`, `Container`, `Section`, `Row`, `Column`, `Heading`, `Text`, `Hr`, `Img`, `Link`, `Button`, `CodeInline`, `CodeBlock`, and `Markdown`.
- Added async `render()` and synchronous `renderSync()` APIs.
- Added conditional render package exports for node, browser, worker, deno, workerd, edge-light, and convex-style runtimes.
- Added Tailwind v4 utility compilation and email-safe style inlining.
- Added Markdown rendering with styled headings, paragraphs, lists, links, tables, quotes, images, and code output.
- Added Prism-based code block and inline code components.
- Added Solid Vite SSR and TanStack Start Solid integration fixtures.
- Added GitHub issue templates, discussion templates, pull request template, CI workflows, and per-package release scripts.
- Added MIT license, README, and Solid Email agent skill documentation.

### Changed

- Published component package name is scoped as `@akin01/solid-email`.
- Initial package version is `0.1.0` for the monorepo packages.

### Verified

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`
- `pnpm lint`
