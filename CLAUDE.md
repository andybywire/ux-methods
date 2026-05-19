# UX Methods

## Identity & scope

This repository is **UX Methods** — Andy Fitzgerald's personal knowledge-graph project, published at [uxmethods.org](https://www.uxmethods.org/). It is **separate from his Elemeno Health work**. Do not assume Elemeno conventions, schemas, tooling choices, or codebase patterns carry over here; treat this project on its own terms.

## What UX Methods is

UX Methods provides a roadmap between and across the practices of user experience design. Its goal is to help UX practitioners arrive at purposeful, high-impact, user-centered design outcomes.

The web has no shortage of techniques, tools, and tips on how to "do" UX. Very few resources, however, explain how to use UX methods _together_, in a coordinated and purposeful way, to create holistic solutions. UX Methods fills that gap by:

- Assembling concise, reliable descriptions of UX method goals, steps, and outcomes
- Highlighting the meaningful relationships between methods so practitioners can craft holistic, purpose-driven project plans
- Collecting and contextualizing in-depth how-tos, case studies, and research from trustworthy sources on the web

## Project goal — knowledge graph maturation

UX Methods today uses a light taxonomy to coordinate methods. The active goal is to build on that foundation so the content collection, external resources, and semantic models become a **proper knowledge graph** that delivers significant value above and beyond the sum of its parts.

Specifically:

- Use knowledge-graph approaches to enrich content, sharpen the expression of ideas, and improve the user experience
- Build and demonstrate a skillset focused on generating new value and insight through the combination of structured, composable content and formal, domain-specific semantics
- **Preferred (not required):** make use of OWL, SPARQL, and semantic inference
- **Optional, where helpful:** SHACL, R2RML, and OTTR templates

When proposing changes to the graph layer, lean into these technologies rather than ad-hoc procedural workarounds; that's the demonstration this project exists to provide.

## Repository layout

Monorepo (pnpm workspaces — see `pnpm-workspace.yaml`):

- **`studio/`** — Sanity Studio. Source of truth for content: methods, disciplines, external resources, and the inputs/outputs (IO) taxonomy. Schemas in `studio/schemaTypes/`.
- **`astro/`** — The public uxmethods.org website, built with Astro from Sanity content. Supports Sanity Visual Editing for real-time previews.
- **`graph/`** — Knowledge graph assets (see "KG architecture" below for layer details).
- **`functions/`** — Sanity Functions.
- **`sanity.blueprint.ts`** — Sanity blueprint config.

**Triplestore:** Apache Jena **TDB2** behind a **Fuseki** front end, hosted on a Raspberry Pi at home and exposed publicly through nginx + a Cloudflare Tunnel at `fuseki.uxmethods.org`. The active production dataset is `/ds`; two experimental inference datasets (`/ds-owl`, `/ds-rdfs`) are configured but currently empty. Read endpoint (`/ds/query`) is open; write endpoints (`/ds/data`, `/ds/update`) are gated at nginx by an `X-API-Token` header. Astro queries Fuseki at build time; the export scripts in `graph/scripts/` push named graphs via the Graph Store Protocol. **See [graph/INFRASTRUCTURE.md](graph/INFRASTRUCTURE.md) for the full deployment, dataset, auth, and cleanup-backlog details.**

**URI policy:** taxonomy concepts use hash URIs (`https://uxmethods.org/taxonomies/io#<conceptId>`); ontology terms and method instances use slash URIs. The concept-scheme IRI doubles as the named-graph IRI. See [ADR 0002](docs/decisions/0002-uri-policy-hash-vs-slash.md).

**Query convention:** the `/ds` dataset has `unionDefaultGraph` disabled — queries that touch taxonomy triples must use explicit `GRAPH <…> { … }` clauses. See [ADR 0003](docs/decisions/0003-explicit-graph-clauses.md).

## KG architecture — three layers

The single most important architectural decision in this project: the graph is deliberately separated into three layers that evolve at different speeds. Preserve this separation when proposing changes.

### 1. Ontology (TBox) — curated, stable

- File: `graph/ontologies/uxmethods-core.ttl`
- Contains: classes (`Method`, `Resource`) and object properties (`usesInput`, `producesOutput`, `hasUpstreamMethod`/`hasDownstreamMethod` with OWL property chains) for the actively-used core. PROV-O alignment was removed in 0.2.0 and will be reintroduced when its axioms come into use.
- Edited by hand. Versioned. This is the **stable semantic contract** that downstream tools depend on.

### 2. Taxonomy (SKOS) — generated from Sanity, replaceable

- Generated file: `graph/build/io-taxonomy.ttl`
- Inputs/outputs modeled as `skos:Concept` instances.
- Concept scheme IRI: `https://uxmethods.org/taxonomies/io`
- Concept IRIs: `https://uxmethods.org/taxonomies/io#<conceptId>`
- Generator: `graph/scripts/io-taxonomy-export.js` — fetches scheme + concepts via GROQ, writes Turtle, optionally PUTs to Fuseki via Graph Store Protocol into the named graph above (using `X-API-Token` header).

### 3. Methods data (ABox) — generated from Sanity, replaceable

- Generated file: `graph/build/methods-data.ttl`
- Method IRIs: `https://uxmethods.org/method/<Slug>` (e.g. `…/method/Wireframing`).
- Methods are linked to SKOS concepts via `uxm:usesInput` / `uxm:producesOutput`.
- Generator: `graph/scripts/method-export.js`.

**Generated artifacts are disposable.** Regenerate from Sanity whenever content changes. Only TBox files in `ontologies/` are hand-curated. Both generators emit `owl:Ontology` headers so Protégé imports them by logical IRI without "physical URI" warnings — preserve this when modifying the exporters.

## Local prototyping (Protégé workspace)

Open one file in Protégé and the whole integrated KG comes with it:

- `graph/ontologies/workspace.ttl` — wrapper ontology that imports the core ontology, the IO taxonomy export, and the methods export.
- `graph/ontologies/catalog-v001.xml` — maps the logical IRIs of those imports to local files in the repo.

When iterating locally, point Protégé at `workspace.ttl` and register the catalog. Don't edit generated files in `build/` — change the source in Sanity and re-run the exporter.

**Snap SPARQL vs built-in SPARQL — important trap:**
- Protégé's **Snap SPARQL plugin queries over inferred facts** (it runs against the reasoner's materialized model).
- Protégé's **built-in SPARQL tab queries asserted triples only** — inferred edges (from property chains, etc.) will not appear.

If a query "works in Snap SPARQL but returns nothing in the built-in tab," that's the reason. This is a preview of the same question we'll face in Fuseki: inference-at-query-time vs derived-graph materialization (see below).

## Method-to-method relationships

Methods are connected through the **inputs/outputs (IO) taxonomy**. A concept that is an _output_ of one method is an _input_ to another (e.g. "user's mental model" is an output of contextual research and an input to navigation design). This IO model is the seed the larger knowledge graph builds on — keep it intact when proposing schema or ontology changes.

### SPARQL-based relationship logic

Today the site computes relationships via SPARQL joins:

- **Upstream methods:** "who produces what I need" (their outputs match my inputs).
- **Downstream methods:** "who needs what I produce."
- **Weights:** `COUNT(DISTINCT ?shared)` over shared IO concepts.
- **Multi-origin variant:** a UNION/`VALUES` query that runs for one or many origin methods at once.

Reference query: `graph/queries/method-output-enables-method-input.rq`.

### Inference work in progress

Some of this join logic is being moved into ontology semantics:

- Object properties `uxm:hasUpstreamMethod` and `uxm:hasDownstreamMethod` are defined in the core ontology.
- **OWL property chain axioms** let a reasoner infer these edges from `usesInput` / `producesOutput` + shared concepts.

Note that plain RDFS inference will **not** apply OWL property chains — you need an OWL-capable entailment regime (OWL RL or rules).

## Open architectural decision — how inference runs in production

There are two viable production paths. Both are real; the project hasn't committed yet.

### A. Query-time inference in Fuseki
Configure Fuseki with an OWL-capable reasoner so `hasUpstreamMethod` / `hasDownstreamMethod` appear as entailments at query time. Simpler conceptually; performance and entailment-regime selection are the questions.

### B. Materialized derived graph (currently the pragmatic favorite)
A scheduled step computes upstream/downstream edges, weights, and optional explanations (which shared concepts caused each link), and writes them into a derived named graph (e.g. `https://uxmethods.org/graph/derived`). UI queries hit asserted triples only — extremely fast, easy to explain, easy to debug.

When making suggestions in this area, weigh both options honestly; don't quietly default to one. The "fast product value + strong foundation" framing tends to favor (B) once performance matters, but (A) is the more semantically pure demonstration.

## Future direction — richer plan semantics

Longer-term, methods may be modeled as structured **plans** (steps, prerequisites, outputs) using **P-Plan** / **PROV Plan**, with executions and case studies mapped onto those plans. Not active work yet; flag it if proposed changes would constrain that direction.

## Working principles for this repo

- **Lean into formal semantics.** This project exists to demonstrate KG approaches — prefer OWL/SPARQL/SHACL solutions over ad-hoc procedural workarounds when working on the graph layer.
- **Stable IRIs and predicates.** Downstream tools (eventual plan builder / stack generator) depend on them. Don't rename casually.
- **Generated vs curated.** Treat `graph/build/*` as disposable. Treat `graph/ontologies/*` as the contract.

## Where to find things

- **[graph/README.md](graph/README.md)** — local development: IRI conventions, named-graph strategy, Protégé workflow, exporter script usage, troubleshooting.
- **[graph/INFRASTRUCTURE.md](graph/INFRASTRUCTURE.md)** — production deployment: topology diagram, Fuseki datasets, endpoints, auth, GSP, and the operational cleanup backlog.
- **[docs/decisions/](docs/decisions/README.md)** — architecture decision records (ADRs). Significant choices like the three-layer separation, URI policy, the `unionDefaultGraph` stance, and the open production-inference question live here with their rationale.
- **[astro/CLAUDE.md](astro/CLAUDE.md)** — how the site talks to Sanity and Fuseki, current SPARQL integration shape, and the conventions to follow when adding queries.

When adding new context that isn't a fit for any of these, prefer extending one of them over creating yet another doc. New ADRs are fine and encouraged for significant decisions.
