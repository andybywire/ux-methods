# sanity-plugin-mermaid-content-model

A Sanity Studio plugin that renders the Studio's content model as a [Mermaid](https://mermaid.js.org/) class diagram, inside Studio.

> **Status: in-monorepo development.** This workspace lives inside the [UX Methods](../) monorepo for now, but its internals are already shaped like a standalone plugin (`@sanity/pkg-utils` build, `source`/`default` exports, Vitest). It will be extracted to its own repo later — see [ADR 0007](../docs/decisions/0007-content-model-plugin-architecture.md). Build progress is tracked in the phased plan in [docs/ui-design.md](docs/ui-design.md).

## How it works

The plugin reuses the same pipeline as the [`content-model/`](../content-model) CLI:

- **`probe`** — introspects a field's `validation` function to recover cardinality and constraint markers.
- **`walker`** — turns a Sanity schema into a `CanonicalModel` (classes, edges, warnings).
- **`emit-mermaid`** — renders a `CanonicalModel` as a Mermaid `classDiagram` string.

These three modules are **copied** from the CLI (which remains the reference implementation) and pinned by the same test suites. The contract they satisfy is documented in [ADR 0006](../docs/decisions/0006-content-model-mermaid-export.md).

Where the CLI loads schema types from `studio/schemaTypes/index.ts` via `tsx`, the plugin reads the **fully-composed** workspace schema via Studio's `useSchema()` (`src/schema-adapter.ts`) — which includes plugin-contributed types (e.g. `skosConcept`) the CLI can't see. From there it walks → filters (Elements menu) → emits, and renders the Mermaid SVG in a top-nav tool.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm test` | Run the Vitest suite once. |
| `pnpm test:watch` | Watch mode. |
| `pnpm typecheck` | `tsc --noEmit` against `src` + configs. |
| `pnpm build` | Build `dist/` with `@sanity/pkg-utils`. |

## Development (in-monorepo)

Run the studio and open the **Content Model** tool:

```
pnpm --filter ux-methods-studio dev
```

The studio serves this plugin from its **TypeScript source** (`src/`), not from `dist/`, so edits hot-reload live with no rebuild. This works via a scoped Vite alias in [`studio/sanity.cli.ts`](../studio/sanity.cli.ts) — necessary because Vite doesn't honor the package's `source` export condition, and a global `source` condition would also pull `@sanity/ui` from source. The alias is **in-monorepo dev scaffolding and will be removed at extraction**.

If a source edit doesn't appear after a dev-server restart, clear Vite's cache once: `rm -rf node_modules/.vite` (from `studio/`).

See [docs/plugin-development-best-practices.md](../docs/plugin-development-best-practices.md) for the full plugin-development methodology (architecture, TDD, this dev-loop gotcha, and CI/CD).
