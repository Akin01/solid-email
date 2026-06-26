# Changelog

All notable changes to this project will be documented in this file.

## 0.1.4 - 2026-06-26

### Changed

- Bumped `@solid-email/render` and `@akin01/solid-email` to `0.1.4` so both publishable packages can be released together after the client-entrypoint fix.
- Bumped the private monorepo metadata and Solid Email skill metadata to `0.1.4`.
- Expanded the Solid Email skill docs with the DOM/CSR preview path: import preview-safe components from `@akin01/solid-email/client` and mount them with Solid's DOM `render` from `solid-js/web`.
- Clarified that `@akin01/solid-email/client` intentionally excludes `render`, `compile`, and `Tailwind`; use `@solid-email/render` or the `@akin01/solid-email` package root for server/email HTML string generation.

### Related commits

- Client entrypoint fix
  - [`fd6c609f6b6c`](https://github.com/Akin01/solid-email/commit/fd6c609f6b6cb6c25dfe18c68e4cffbcd42b633a) Merged PR #9 for `fix/client-entrypoint-issue-8`.
  - [`b766a8eb5c40`](https://github.com/Akin01/solid-email/commit/b766a8eb5c40d85170d8f8e46b2608d12c5320c4) Added the DOM client entrypoint.

### Verified

- `pnpm --filter @akin01/solid-email run test -- src/index.spec.tsx`
- `pnpm --filter @solid-email/render run test -- src/entrypoints.spec.tsx`
- `pnpm biome check package.json packages/solid-email/package.json packages/render/package.json`
- `node scripts/create-github-releases.mjs --dry-run --package-version @solid-email/render@0.1.4 --package-version @akin01/solid-email@0.1.4`

## 0.1.3 - 2026-06-25

### Added

- Added `@solid-email/html-to-text`, a bundled HTML-to-text converter used by `@solid-email/render`.
- Added optional precompiled plain-text output via `compile(..., { withPlainText: true })`.
- Added HTML-to-text benchmarks comparing Solid Email, React Email, `@solid-email/html-to-text`, and the npm `html-to-text` package.

### Changed

- Split compile-time options from compiled render options: compile controls reusable template artifacts, while compiled render chooses HTML or plain-text output.
- Replaced `@solid-email/render`'s direct `html-to-text` dependency with the workspace `@solid-email/html-to-text` package.
- Allowed GitHub release creation to validate package-specific versions independently, so `@solid-email/html-to-text` can publish on its own version track.
- Made the publish workflow run `pnpm publish` from the resolved package directory.

### Related commits

- Package integration
  - [`93df83631b0a`](https://github.com/Akin01/solid-email/commit/93df83631b0a889e5d2f5386a33b8a2e411458fd) Added the bundled `@solid-email/html-to-text` converter package and wired `@solid-email/render` to use it.
- Render API
  - [`6f094fb0d723`](https://github.com/Akin01/solid-email/commit/6f094fb0d723abd5673534dc64c3b18b46520a24) Added precompiled plain-text templates for compiled render output.
- Shared config
  - [`80b514990350`](https://github.com/Akin01/solid-email/commit/80b514990350232c099ed99e4ec33a33dec0f369) Reused shared package test configs across benchmarks and e2e projects.
- Benchmark coverage
  - [`6e2ea6d31ba6`](https://github.com/Akin01/solid-email/commit/6e2ea6d31ba6c5cf44952f1dbb034afd2acde634) Added HTML-to-text compiled plain-text rendering benchmark coverage.

### Verified

- `pnpm test`
- `node scripts/create-github-releases.mjs --dry-run`
- `node scripts/create-github-releases.mjs --dry-run --package-version @solid-email/html-to-text@0.1.1 --package-version @solid-email/render@0.1.3 --package-version @akin01/solid-email@0.1.3`
- `pnpm publish --dry-run --access public --no-git-checks` from each publishable package directory
- `pnpm typecheck`
- `pnpm --filter @benchmarks/html-to-text run typecheck`
- `BENCH_ITERATIONS=1 pnpm --filter @benchmarks/html-to-text run benchmark`

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
