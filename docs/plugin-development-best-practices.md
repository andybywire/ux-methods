# Plugin development best practices

> **Living reference.** Distilled while building `sanity-plugin-mermaid-content-model` in this monorepo, and meant to be carried forward (and copied/adapted) for future Sanity Studio plugin work. Update it as we learn more — the CI/CD section in particular is a stub to be filled when we add release tooling.

This captures the *process and hard-won lessons*, not the plugin's feature spec (that's the plugin's own `docs/`). Where a decision has a longer rationale, it links out (e.g. [ADR 0007](decisions/0007-content-model-plugin-architecture.md)).

---

## 1. Repo & lifecycle: in-monorepo first, extract later

Develop the plugin as a **workspace inside the consuming monorepo first**, then extract it to its own repo once it's mature. This gives the best of both:

- You test against the **real Studio** (with its real plugins and schema) from day one — far better than a synthetic test studio. For us, this is what let `useSchema()` actually surface plugin-contributed types.
- Extraction stays low-drama **only if the plugin's internals are already standalone-shaped** (next section). The directory name matches the eventual npm/repo name so extraction is a clean `git filter-repo --subdirectory-filter`.

Split work into "adopt now" (the plugin itself) vs "adopt at extraction" (the publishing/CI shell — see §8). The latter doesn't touch plugin code, so adding it later is purely additive.

## 2. Internal architecture: standalone-shaped from day one

Mirror the canonical `@sanity/plugin-kit` / `@sanity/pkg-utils` layout (good reference: [`bobinska-dev/sanity-plugin-rich-table`](https://github.com/bobinska-dev/sanity-plugin-rich-table)):

- **`@sanity/pkg-utils` build** (`package.config.ts`) → `dist/` + types.
- **`exports` map** with a `source` condition (`./src/index.tsx`) and a `default` condition (`./dist/index.js`). *(See §3 for the catch.)*
- **Three-tsconfig split:** `tsconfig.settings.json` (shared, strict), `tsconfig.json` (dev/typecheck: src + configs), `tsconfig.dist.json` (build: src minus tests + test utils).
- **Pure core + thin component shell.** Put all real logic in pure, framework-free modules composed via a single canonical data type (our seam was the `CanonicalModel`). The React components only wire Studio context (`useSchema`, theme, clipboard, toasts) to those pure functions. This is what makes the bulk of the code testable without a DOM and keeps the component layer trivially small.
- **Isolate framework/host coupling to one module.** Our `useSchema()` access lives in exactly one adapter; if Sanity changes, one file changes.

## 3. The in-monorepo dev loop (the gotcha) — alias the plugin to its source

**The trap:** the `source` export condition does *not* make `sanity dev` pick up your `src/` automatically. Vite (what `sanity dev`/`sanity build` use) does **not** include `source` in its resolve conditions, so it resolves the plugin's `exports` to `default → ./dist/index.js` — i.e. the **stale built output**. Symptom: you edit `src/`, restart the dev server, and nothing changes.

**Why you can't just add `source` globally:** other ecosystem packages (e.g. `@sanity/ui`) also ship a `source` condition pointing at *their* untranspiled TypeScript. Adding `source` to Vite's global `resolve.conditions` would make Vite try to load all of those from source too — breakage.

**The fix:** in the consuming studio's `sanity.cli.ts`, add a **scoped Vite alias** that points only your plugin at its source entry:

```ts
// studio/sanity.cli.ts
vite: {
  resolve: {
    alias: [
      {
        find: /^sanity-plugin-my-plugin$/, // anchored: don't catch subpaths
        replacement: path.resolve('../sanity-plugin-my-plugin/src/index.tsx'),
      },
    ],
  },
},
```

Now `sanity dev` serves the plugin from source with HMR (live edits, no rebuild), and `sanity build` bundles from source too. The plugin's own `dist/` is then only needed for the published package and the plugin's `pnpm build` self-check.

**Remove this alias at extraction**, when the studio consumes the published package normally.

## 4. TDD practices

- **Test-first, tight cycles.** Write the test, see red, write the implementation, see green. When the implementation is genuinely obvious (a one-line pure transform), it's fine to skip the "write a deliberately-wrong impl first" step — but **say so explicitly** rather than drifting into test-after.
- **Pure logic carries the weight.** Because logic lives in pure functions, most tests are plain input→output with hand-built fixtures and no mocks. Fast, deterministic.
- **One integration test per impure seam.** Each module that touches the outside world (the schema adapter, the orchestrator) gets at least one test that exercises it end-to-end against a realistic fixture. These catch structural bugs unit tests miss.
- **Strict `toEqual` on contract types.** Pin the canonical data shape exactly; it catches drift when the model grows (at the cost of touching old tests when you add a field — worth it).
- **Type your fixtures with the contract type.** A fixture that doesn't represent a valid model then fails to compile rather than at runtime.
- **Pre-commit gate: `pnpm test && pnpm typecheck` (+ `pnpm build` when the public surface changed).** Both test and typecheck are hard gates — Vitest's esbuild transform does **not** enforce types, so `tsc --noEmit` is its own pass. `exactOptionalPropertyTypes` in particular catches real bugs (e.g. passing `boolean | undefined` to an optional `attributes?: boolean` — resolve to a concrete value before passing).
- **Phased delivery with pauses (§7).** Small reviewable chunks, each green before moving on.

## 5. Testing components with jsdom (lean)

DOM tests are worth it for **interaction wiring** (a click calls the right handler, a toggle re-renders, a warning shows) — not for visual correctness, which stays an eyeball check. Keep it lean:

- **Setup:** `environment: 'jsdom'` + `@testing-library/react` + `@testing-library/jest-dom`. Transform JSX via Vitest's `esbuild: {jsx: 'automatic'}` — you do **not** need `@vitejs/plugin-react` (and it may pin a Vite version that conflicts).
- **Mock the browser-only APIs jsdom doesn't implement** — for us: `mermaid.render`, `navigator.clipboard`, and (coming) `<canvas>`. Use `vi.hoisted` to share a spy with a hoisted `vi.mock` factory.
- **Stub `window.matchMedia`** in the test setup file — jsdom lacks it and `@sanity/ui`'s responsive hooks call it (components that use plain DOM won't trip this; ones using `@sanity/ui` will).
- **A shared provider wrapper.** `@sanity/ui` components need their providers. A `renderWithUi` helper wrapping in `ThemeProvider` → `LayerProvider` → `ToastProvider` (mirroring the Studio stack) covers buttons, toasts, popovers/portals. Put it under `src/test/` and **exclude `src/test/**` from the dist build**.
- **With Vitest `globals: false`, `@testing-library/react` auto-cleanup does NOT run.** Add `afterEach(() => cleanup())` to every component test file, or rendered DOM accumulates across tests and queries find "multiple elements."
- **Don't over-test the shell.** The thin container that calls `useSchema()` is left to the live eyeball check; its logic already lives (and is tested) in pure modules.

## 6. Sanity / @sanity/ui specifics & gotchas

- **Reading the composed schema:** `useSchema()` returns the compiled `Schema`; its `_original.types` holds the raw authored `defineType` array (config + every plugin, validation functions intact). It's marked `@internal` — guard the access and degrade gracefully. See [ADR 0007](decisions/0007-content-model-plugin-architecture.md) for the risk analysis.
- **`@sanity/ui` v3 spacing prop is `gap`, not `space`** (on `Stack`/`Flex`).
- **Theme for tests:** `buildTheme()` from `@sanity/ui/theme` (the older `studioTheme` is deprecated).
- **`@types` are type-only** (`@sanity/types`), safe to depend on without runtime bloat.
- **`exactOptionalPropertyTypes`** (recommended on) forbids passing an explicit `undefined` to an optional property — resolve `opts.x ?? default` before handing it on.

## 7. Phased delivery & review cadence

- **One coherent phase at a time; pause for review between phases.** Don't bundle multiple phases even after an overall plan is approved.
- **Pure logic first, UI second.** Land and test the pure transform, then build the component on top. The UI phase ends with a **live eyeball check** (the author runs the Studio — visual correctness, theme, and anything behind auth that automated checks can't reach).
- **Record deferred decisions** in the plugin's `docs/` so postponed choices (and *why*) aren't lost.
- **Commit per phase**, folding tightly-coupled sub-steps into the phase commit.

## 8. CI/CD & release scaffolding *(to be completed at extraction)*

Stub — fill in when we build it. Planned, modelled on `sanity-plugin-rich-table`:

- Conventional commits + `commitlint` + `semantic-release` (`@sanity/semantic-release-preset`) for automated versioning/publishing.
- `husky` pre-commit running `lint-staged` (eslint + `tsc --build`).
- CI matrix (OS × Node) with separate build / test / release jobs.
- A cross-version install smoke test (install the built tarball into throwaway Studios for the Sanity majors you support).
- `plugin-kit link-watch` for linking into external studios during dev.
- At extraction: flip `private: true` → public, add `publishConfig.exports`, add `browserslist`, and **remove the in-monorepo dev alias** (§3).
