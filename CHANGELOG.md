# Changelog

All notable changes to this project will be documented in this file.

## 2.0.0-beta - 2026-10-02

### Breaking Changes

- Migrated to SolidJS v2.0 (`solid-js@^2.0.0-rc.0` and `@solidjs/web@^2.0.0-rc.0`).
- Switched JSX runtime and types to `@solidjs/web` across all packages (`jsxImportSource: "@solidjs/web"`).
- Replaced internal `renderToStringAsync` with `renderToStream` from `@solidjs/web`.
- Replaced `createResource` and `Suspense` in `Tailwind` with `createMemo` and `Loading` from `solid-js`.
- Replaced `splitProps` with `omit` across components.
- Removed legacy `attr:` namespace prefix on HTML attributes in table primitives in favor of standard HTML attributes (`align`, `width`, `border`, `cellpadding`, `cellspacing`).
- Replaced `vite-plugin-solid` with `@solidjs/vite-plugin`.
- Bumped minimum Node engine requirement to `>=22.12.0` in alignment with SolidJS v2.

### Added

- Added bounded LRU and WeakMap compilation caching for `@solid-email/html-to-text` `convert()`, achieving nearly 20x faster repeated text conversions.
- Added selector decision tree caching for Selderee AST parsing.
- Added a 64KB `Uint8Array` character lookup table for O(1) whitespace classification.
- Added tag-level memoization (`tagCache`) to `TailwindRenderPlan` for O(1) repeated element inlining.
- Added direct SSR `{ t: string }` template extraction (`extractSsrHtml`) for slot rendering to bypass redundant `renderToString` root creation.
- Added `resolveContentSlotName` for case-insensitive slot matching under uppercase text transformations (e.g., headings).

### Changed

- Bumped `@akin01/solid-email`, `@solid-email/render`, and `@solid-email/html-to-text` to `2.0.0-beta`.
- Bumped private monorepo metadata and Solid Email skill metadata to `2.0.0-beta`.
- Updated all benchmark suites and E2E integration fixtures (Vite, TanStack Start, Cloudflare TanStack Start) to SolidJS v2.0.
- Replaced dynamic regex compilation in Tailwind attribute handling with static pre-compiled regexes.
- Added `noScripts: true` to `solidRenderOptions` for synchronous and streaming SSR.

### Related commits

- SolidJS v2.0 migration
  - [`d00b107`](https://github.com/Akin01/solid-email/commit/d00b107) `feat: migrate core workspace to SolidJS v2.0`
- Integration and benchmark updates
  - [`696635a`](https://github.com/Akin01/solid-email/commit/696635a) `feat(e2e): update integration fixtures for SolidJS v2.0`
  - [`f060b0e`](https://github.com/Akin01/solid-email/commit/f060b0e) `feat(benchmarks): update benchmark suites and templates for SolidJS v2.0`
- Performance optimizations
  - [`3718db6`](https://github.com/Akin01/solid-email/commit/3718db6) `perf(html-to-text): optimize compilation memoization, whitespace classification, and text builder`
  - [`75d9ab2`](https://github.com/Akin01/solid-email/commit/75d9ab2) `perf(render,solid-email): optimize slot replacement, template parsing, and tailwind inlining`

- Release and documentation
  - [`7bde2cd`](https://github.com/Akin01/solid-email/commit/7bde2cd) `release: bump version to 2.0.0-beta and update changelog and benchmarks documentation`

### Verified

- `pnpm build`
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm benchmark:rendering`
- `pnpm benchmark:cross-library`
- `pnpm benchmark:tailwind`
- `pnpm benchmark:html-to-text`

## 0.1.5 - 2026-07-05

### Added

- Added a cross-library email benchmark suite comparing Solid Email with React
  Email, JSX Email, and MJML React across render latency, throughput, heap
  usage, output size, and pairwise HTML conformance.
- Added the `pnpm benchmark:cross-library` script for running the
  cross-library benchmark suite from the workspace root.

### Changed

- Bumped `@solid-email/render` and `@akin01/solid-email` to `0.1.5` so both
  publishable packages can be released together with the benchmark and Workerd
  compatibility updates.
- Bumped the private monorepo metadata and Solid Email skill metadata to
  `0.1.5`.
- Updated e2e fixture tarball references to `0.1.5` so published-package
  integration tests install the current release artifacts.
- Browser-condition imports from `@akin01/solid-email` now resolve to the
  DOM/CSR preview build, replacing the public `@akin01/solid-email/client`
  subpath while keeping server, Workerd, and default imports on the SSR/email
  rendering build.
- Browser-condition `require('@akin01/solid-email')` now resolves to the
  DOM/CSR preview CJS build.
- Default/root ESM and CJS server entries now share Solid's server runtime for
  Tailwind resource rendering, preventing CJS `Tailwind` renders from splitting
  Solid SSR context.
- Tailwind's CSS Tree usage now imports the exported browser/dist ESM bundle to
  avoid Node `createRequire`/`mdn-data` JSON loading in Workerd bundles.

### Related commits

- Cross-library benchmark suite
  - [`03d9a87069f3`](https://github.com/Akin01/solid-email/commit/03d9a87069f37a15870428525aec9cd18614b580) Merged PR #14 for `feat/add-cross-library-benchmark`.
  - [`47352df6af85`](https://github.com/Akin01/solid-email/commit/47352df6af851df8920ee7f7a73ba4e8d6b52396) Addressed cross-library benchmark review feedback.
- Workerd-safe root exports and rendering
  - [`691ed9560834`](https://github.com/Akin01/solid-email/commit/691ed95608341c664c8d80335e001faea667cf9a) Added Workerd-safe root export conditions, server/runtime fixes, and Cloudflare TanStack Start coverage.
  - [`9c6bb421f37b`](https://github.com/Akin01/solid-email/commit/9c6bb421f37b427bc9f05305a3bac63a886d4857) Added the TypeScript shim for CSS Tree's dist ESM entry used by Workerd-safe Tailwind imports.
- Documentation and bundle metrics
  - [`4a38f8e2af11`](https://github.com/Akin01/solid-email/commit/4a38f8e2af117d53a49535844c78e5a184719a40) Updated browser-root documentation, Solid Email skill guidance, and recomputed bundle-size comparisons.

### Verified

- `pnpm exec biome check package.json packages/solid-email/package.json packages/render/package.json skills/solid-email/SKILL.md README.md CHANGELOG.md benchmarks/cross-library/tsconfig.json e2e/vite/package.json e2e/tanstack-start/package.json e2e/cloudflare-tanstack-start/package.json e2e/vite/pnpm-workspace.yaml e2e/tanstack-start/pnpm-workspace.yaml e2e/cloudflare-tanstack-start/pnpm-workspace.yaml`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm --filter @benchmarks/cross-library run typecheck`
- `pnpm benchmark:cross-library`
- `node scripts/create-github-releases.mjs --dry-run --package-version @solid-email/render@0.1.5 --package-version @akin01/solid-email@0.1.5`

## 0.1.4 - 2026-06-26

### Changed

- Bumped `@solid-email/render` and `@akin01/solid-email` to `0.1.4` so both publishable packages can be released together after the client-entrypoint fix.
- Bumped the private monorepo metadata and Solid Email skill metadata to `0.1.4`.
- Expanded the Solid Email skill docs with the DOM/CSR preview path: import preview-safe components from `@akin01/solid-email/client` and mount them with Solid's DOM `render` from `solid-js/web`.
- Clarified that `@akin01/solid-email/client` intentionally excludes `render`, `compile`, and `Tailwind`; use `@solid-email/render` or the `@akin01/solid-email` package root for server/email HTML string generation.
- Updated the GitHub release script so package-specific release inputs create only those requested releases instead of also recreating packages that are on independent version tracks.

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
