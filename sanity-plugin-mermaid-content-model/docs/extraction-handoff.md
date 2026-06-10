# Handoff: extract the plugin to a standalone repo + add the CI/release shell

> Starter document for the next session. Written at the end of the build session that completed the plugin's foundational phases. Read this top-to-bottom first (~15 min) — it carries the context forward so we start informed.

## What you're picking up

`sanity-plugin-mermaid-content-model` was built **in-monorepo first** inside the [UX Methods](../../) repo (per [ADR 0007](../../docs/decisions/0007-content-model-plugin-architecture.md)), with internals already shaped like a standalone Sanity plugin. The foundational feature work (phases 1–6) is **done and committed** on the branch `sanity-plugin-mermaid-content-model`.

The next phase is the **"adopt at extraction" column** from ADR 0007: carve the plugin out into its own repository (preserving history), give it a built-in dev studio, and add the publishing/CI shell (semantic-release, commitlint/husky, CI matrix, npm publish). None of this touches the plugin's `src/` — it's all additive outer shell, which is exactly why we deferred it.

**Andy will have thought about repo/npm naming and publishing logistics between sessions — ask for those decisions up front; they shape the first moves.**

## Read these first (in order)

1. **[`docs/plugin-development-best-practices.md`](../../docs/plugin-development-best-practices.md) — especially §1 (lifecycle) and §8 (CI/release).** §8 is the stub we're now filling; it lists the planned tooling. This is the reusable methodology doc; treat it as the spec for the shell and **update §8 from "stub" to "done" as you build it.**
2. **[ADR 0007](../../docs/decisions/0007-content-model-plugin-architecture.md)** — the in-monorepo-first → extract decision, the "adopt now vs adopt at extraction" table, and the extraction checklist in Consequences (private→public, `publishConfig`, flip `workspace:*`, remove the dev-loop alias).
3. **[`bobinska-dev/sanity-plugin-rich-table`](https://github.com/bobinska-dev/sanity-plugin-rich-table)** — the canonical layout we modelled the plugin on, and the reference for the shell: `package.config.ts`, the three-tsconfig split, `studio/` dev studio as a workspace member, `.releaserc.json` (`@sanity/semantic-release-preset`), `commitlint.config.js`, `.husky/`, `lint-staged.config.js`, `.github/workflows/main.yml`, and `scripts/test-studio-install.mjs`. **Mirror this repo's shell.**
4. **[`docs/ui-design.md`](ui-design.md)** — the plugin's feature spec and the **Deferred decisions** (derived object visibility, per-item defaults, deeper theming, PNG-vs-SVG export, drag-to-rearrange). Not part of extraction, but good to know what's intentionally unbuilt.
5. **[`README.md`](../README.md)** and the plugin configs (`package.json`, `package.config.ts`, `tsconfig*.json`, `vitest.config.ts`) — the current shape you're carving out.

## State at handoff

- **Branch:** `sanity-plugin-mermaid-content-model` (off `main`). Foundation complete at commit `3e6eec5`. Phase commits read like a build log: Step A (scaffold), Step B (adapter), Phase 1 (tool/render) → Phase 6 (pan/zoom).
- **Tests/gate:** 183 tests, `tsc --noEmit` clean, `pnpm build` (pkg-utils) clean, full `sanity build` (studio with the plugin) clean.
- **What the plugin does:** a top-nav Studio tool rendering the live workspace schema (via `useSchema()._original.types`, so plugin-contributed types like `skosConcept` are included) as a Mermaid `classDiagram`, with: Elements menu (category + per-class filtering, show/hide-all, Hide Orphan Objects, dependent inline/PT objects auto-follow their parent), light/dark theme following Studio's colour scheme, Copy Code, Copy PNG, and pan/zoom with fit-to-view.
- **Internals (already standalone-shaped):** `@sanity/pkg-utils` build, `exports` map with `source`/`default` conditions, three-tsconfig split (`tsconfig.settings.json` / `tsconfig.json` / `tsconfig.dist.json`), Vitest with a lean jsdom setup. Pure pipeline (`probe`/`walker`/`emit-mermaid`) is **copied** from the `content-model/` CLI — the plugin owns its copies, so extraction does **not** affect the CLI (which stays in ux-methods as the reference impl).
- **`private: true`**, no `publishConfig`, no `browserslist`, no CI/release tooling yet. Deps: `@sanity/icons`, `@sanity/ui`, `mermaid`, `react-zoom-pan-pinch` (runtime); `react`/`react-dom`/`sanity` peers; dev: pkg-utils, vitest, jsdom, testing-library, types.
- **How ux-methods currently consumes it:** `studio/package.json` has `"sanity-plugin-mermaid-content-model": "workspace:*"`; `studio/sanity.cli.ts` has a **Vite `resolve.alias`** pointing the package at `../sanity-plugin-mermaid-content-model/src/index.tsx` (the dev-loop fix — Vite ignores the package `source` export condition, and a global `source` would break `@sanity/ui`). The `newsletter` document has an `inlineSocialMediaBlock` inline object added purely as a plugin test fixture.

## The extraction plan (sketch — confirm specifics with Andy first)

1. **Carve out with history.** `git filter-repo --subdirectory-filter sanity-plugin-mermaid-content-model/` on a fresh clone → a new repo whose root is the plugin, with the phase-by-phase history preserved. (Recommended over a fresh copy — the commit history is a nice build log. `git filter-repo` rewrites history, so do it on a throwaway clone, then push to the new remote.) Files under `docs/` become the new repo's `docs/` (this handoff included).
2. **Add the built-in dev studio.** The new repo needs its own `studio/` workspace (it currently borrows ux-methods'). Mirror rich-table: a `pnpm-workspace.yaml` with `'.'` + `'studio'`, a minimal `studio/sanity.config.ts` with a synthetic schema + the plugin via `workspace:*`, `studio/sanity.cli.ts`, `studio/package.json`. **Verify the dev loop:** does the standalone dev studio load the plugin's `src` live, or does it hit the same Vite-ignores-`source` problem we solved with an alias in ux-methods? Check exactly how rich-table's `studio` resolves its plugin (its `sanity.cli.ts` uses `vite-tsconfig-paths`, not a source alias — confirm whether that suffices, or whether `pnpm watch`/`link-watch` is the intended dev flow, or whether the same scoped alias is needed). **This is the one genuinely uncertain piece — resolve it early.**
3. **Add the CI/release shell** (best-practices §8 + rich-table): `@sanity/semantic-release-preset` (`.releaserc.json`), conventional commits + `commitlint`, `husky` + `lint-staged`, eslint config, the `.github/workflows` CI matrix (build/test/release), `scripts/test-studio-install.mjs` (cross-version install smoke test for the Sanity majors you support), `browserslist`, and `publishConfig.exports`.
4. **Flip to publishable:** `private: true` → public, add `publishConfig`, license, author, `repository` URL; decide npm scope/name.
5. **Reconnect ux-methods (separate, in this repo):** once the plugin is published, switch `studio/package.json` from `workspace:*` to the published version, **remove the dev-loop alias** in `studio/sanity.cli.ts`, drop `sanity-plugin-mermaid-content-model` from `pnpm-workspace.yaml`, and remove the plugin dir. (Sequencing: you can keep developing in-monorepo until the first publish, then cut over.)

## Things to settle with Andy early

1. **Names:** repo name + npm package name (keep `sanity-plugin-mermaid-content-model`?), and **scope** — unscoped (`sanity-plugin-...`, best for ecosystem discoverability) vs scoped (`@andybywire/...`).
2. **GitHub home:** personal account vs an org.
3. **npm publishing:** public access; npm auth for CI — classic `NPM_TOKEN` secret vs **OIDC trusted publishing** (rich-table's workflow uses OIDC `id-token: write` — cleaner, no long-lived token).
4. **Extraction method:** `git filter-repo` (history-preserving, recommended) vs a fresh repo (clean slate).
5. **Sanity version range to support:** plugin peers are `sanity: ^5` / React 18–19 today. rich-table's install-test covers Sanity 3/4/5 — decide the supported majors and shape `test:studio-install` accordingly.
6. **Cutover timing for ux-methods:** publish first, then switch ux-methods to the npm version and remove the alias/workspace member — or keep in-monorepo a while longer.
7. **Deferred features:** confirm they stay deferred (extract the foundation; iterate after).

## Gotchas / lessons baked in (carry forward)

- **Dev-loop alias.** Vite (sanity dev/build) ignores the package `source` export condition → it loads built `dist/`, not `src/`. A *global* `source` condition can't be used because `@sanity/ui` also ships one (would load its untranspiled source). In ux-methods we used a **scoped Vite alias**. Figure out the standalone-studio equivalent (step 2 above).
- **Commit messages: use `git commit -F <file>`, not `-m`.** Backticks in `-m` get eaten by zsh command substitution (we mangled a commit this session and had to amend).
- **Test setup specifics** (already in the plugin): jsdom needs `window.matchMedia` stubbed (for `@sanity/ui` responsive hooks). If you add tests that mount `react-zoom-pan-pinch`, you'll also need a **`ResizeObserver` stub** (jsdom lacks it) — we avoided it by keeping pan/zoom out of unit tests. `@testing-library/react` auto-cleanup does NOT run with Vitest `globals: false`, so component test files call `afterEach(cleanup)`. Component tests use `src/test/renderWithUi.tsx` (ThemeProvider + LayerProvider + ToastProvider), excluded from the dist build.
- **`@sanity/ui` v3:** spacing prop is `gap` (not `space`); theme via `buildTheme()` from `@sanity/ui/theme`; resolved scheme via `useRootTheme().scheme`.
- **`exactOptionalPropertyTypes` is on** — resolve `opts.x ?? default` before passing to an optional property.
- **Mermaid specifics:** `htmlLabels: false` (avoids `foreignObject` so Copy PNG's canvas isn't tainted); `class.useMaxWidth: false` (definite SVG size, needed by the fit-to-view). Pan/zoom fit uses `react-zoom-pan-pinch`'s `zoomToElement` on the displayed SVG (tagged `data-diagram`), measuring the real element rather than the viewBox.
- **Reading the schema:** `useSchema()._original.types` is `@internal` but is the only source that's raw + validation-preserving + plugin-aware; guarded in `src/schema-adapter.ts`. (Risk analysis in ADR 0007.)

## How Andy works (so the next session fits)

- **Sequential phases, pause for review between them.** Don't bundle, even after an overall plan is approved. ~one coherent chunk → green gate → pause.
- **Eyeball checks are Andy's** (he's the one with a logged-in Studio). Anything visual/behind-auth: get it green + integration-verified, then hand off the eyeball with specific steps.
- **The gate before every commit:** `pnpm test && pnpm typecheck && pnpm build` (+ the consuming `sanity build` when integration changed). Commit only when he says to; commit plugin-coherent units; flag unrelated changes rather than bundling.
- **Honest reporting** — name wrong turns and roll them back (we backed out a too-deep theming attempt and a broken fit implementation this session; he valued the visibility).

## Practical first move

After reading the docs and getting Andy's naming/publishing decisions: resolve the **standalone dev-loop** question (step 2) on a scratch clone *before* committing to the carve-out, then do the `git filter-repo` extraction, then layer the shell in small reviewable steps (dev studio → eslint/format → commitlint/husky → semantic-release → CI → install-test), gating each. Update best-practices §8 as you go.
