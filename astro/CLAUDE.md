# Astro — UX Methods website

This is the public site (`uxmethods.org`) and the preview/SSR build (`preview.uxmethods.org`). It pulls **content** from Sanity (GROQ) and **method-to-method relationships** from Fuseki (SPARQL).

For project-wide context, see the root [CLAUDE.md](../CLAUDE.md). For environment setup, env vars, and dev/preview/build commands, see [README.md](README.md). For the Fuseki deployment specifics, see [../graph/INFRASTRUCTURE.md](../graph/INFRASTRUCTURE.md).

## Two data sources

- **Sanity (GROQ)** — methods, disciplines, external resources, IO taxonomy concept labels. Source of truth for content. Reads use `@sanity/client` via `src/sanity/lib/load-query`.
- **Fuseki (SPARQL)** — semantic relationships between methods. Reads use plain `fetch` POSTs to `https://fuseki.uxmethods.org/ds/query` with `Content-Type: application/sparql-query` and `Accept: application/sparql-results+json`.

The read endpoint is unauthenticated. The Astro build never writes to Fuseki — only the `graph/scripts/*` exporters do.

## Where the Fuseki integration lives today

The only page that queries Fuseki right now is `src/pages/method/[slug].astro`. It:

1. Fires a `getStaticPaths` GROQ query to enumerate method slugs.
2. In parallel, runs one global SPARQL query (`getSharedOutput`) that computes shared input/output counts across **all** method pairs, then filters client-side per page.

This works but is not the long-term shape. Two known gaps, both tracked in [../graph/INFRASTRUCTURE.md](../graph/INFRASTRUCTURE.md) cleanup backlog:

- **The query is global, not method-scoped.** A `TODO` in the file notes the intent to narrow it. Method-scoped queries (and direct joins against SKOS concepts in their named graph) are the planned direction.
- **The predicates don't currently match the curated ontology.** The live query uses `uxmo:hasInput` / `uxmo:hasOutput` in the namespace `https://uxmethods.org/ontology/`. The curated ontology (`graph/ontologies/uxmethods-core.ttl`) and the current exporter (`graph/scripts/method-export.js`) use `uxm:usesInput` / `uxm:producesOutput` in `https://uxmethods.org/ontologies/uxmethods-core#`. **Verify which vocabulary is actually loaded in Fuseki before changing either side** — the query may match older data that hasn't been re-exported under the new predicates.

## SPARQL conventions to follow when modifying or adding queries

- **Use explicit `GRAPH <…> { … }` clauses** when reading the IO taxonomy. The `/ds` dataset has `unionDefaultGraph` disabled, so named-graph triples are invisible from the default graph. See [../docs/decisions/0003-explicit-graph-clauses.md](../docs/decisions/0003-explicit-graph-clauses.md).
- **Don't assume inference at query time.** The production inference strategy is unresolved (see [../docs/decisions/0004-production-inference-strategy.md](../docs/decisions/0004-production-inference-strategy.md)). Today, queries should derive relationships from asserted `usesInput`/`producesOutput` (or whatever current data uses) rather than relying on entailed `hasUpstreamMethod` / `hasDownstreamMethod`.
- **Prefer method-scoped queries over global ones.** Bind the current method's IRI via `VALUES ?method { <…> }` rather than computing relationships across the entire graph and filtering in JS.
- **Result mapping lives next to the query.** See `transformKgData` / `mapMethods` in `src/pages/method/[slug].astro` for the existing shape.

## Auth between Astro and Fuseki

The page reads from `/ds/query`, which is open. `KG_AUTH` is declared in the env (`PUBLIC_*` for the env, `KG_AUTH=` for the secret) and historically intended for write paths — but Astro doesn't write to Fuseki, so it isn't currently sent on any request. If you ever wire Astro to a protected endpoint, the header is `X-API-Token: <token>` (see [../graph/INFRASTRUCTURE.md](../graph/INFRASTRUCTURE.md)).

## Build modes (cheat sheet)

`README.md` is canonical; the short version:

- **SSG / production build:** `astro build` against published Sanity content. Reads Fuseki at build time. Static output served by nginx.
- **SSR preview:** `preview.uxmethods.org`, draft perspective, Sanity stega + overlays for Visual Editing.
- **Local published mode:** `pnpm dev` with `.env.published.local`.
- **Local drafts mode:** `pnpm preview` with `.env.drafts.local` and a Sanity read token.
