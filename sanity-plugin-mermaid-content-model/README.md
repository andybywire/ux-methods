# sanity-plugin-mermaid-content-model

A Sanity Studio plugin that renders the Studio's content model as a [Mermaid](https://mermaid.js.org/) class diagram, inside Studio.

> **Status: Phase 1 — in-monorepo development.** This workspace lives inside the [UX Methods](../) monorepo for now, but its internals are already shaped like a standalone plugin (`@sanity/pkg-utils` build, `source`/`default` exports, Vitest). It will be extracted to its own repo later — see [ADR 0007](../docs/decisions/0007-content-model-plugin-architecture.md).

## How it works

The plugin reuses the same pipeline as the [`content-model/`](../content-model) CLI:

- **`probe`** — introspects a field's `validation` function to recover cardinality and constraint markers.
- **`walker`** — turns a Sanity schema into a `CanonicalModel` (classes, edges, warnings).
- **`emit-mermaid`** — renders a `CanonicalModel` as a Mermaid `classDiagram` string.

These three modules are **copied** from the CLI (which remains the reference implementation) and pinned by the same test suites. The contract they satisfy is documented in [ADR 0006](../docs/decisions/0006-content-model-mermaid-export.md).

Where the CLI loads schema types from `studio/schemaTypes/index.ts` via `tsx`, the plugin will instead read the **fully-composed** workspace schema via Studio's `useSchema()` — which includes plugin-contributed types (e.g. `skosConcept`) the CLI can't see. That adapter is the next build cycle.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm test` | Run the Vitest suite once. |
| `pnpm test:watch` | Watch mode. |
| `pnpm typecheck` | `tsc --noEmit` against `src` + configs. |
| `pnpm build` | Build `dist/` with `@sanity/pkg-utils`. |
