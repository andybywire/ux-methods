# UX Methods Graph

This folder contains the knowledge graph assets for UX Methods: the core ontology, exported instance data, SPARQL queries, and scripts for exporting/pushing RDF to Fuseki.

The near-term goals:

- prototype an integrated knowledge graph locally (Protégé + SPARQL)
- keep ontology (TBox), taxonomy (SKOS), and content instance data (ABox) cleanly separated
- load the same artifacts into Fuseki as named graphs

Long-term goals include:

- maintain UX Methods content quality/consistency over time
- generate semantically rich connections between resources (methods, artifacts, steps, dependencies)
- expose a queryable SPARQL endpoint
- support graph-driven "plan builder" / "method stack generator" tooling

## Directory structure

```
graph/
  build/                       # GENERATED RDF outputs (do not edit by hand)
  ontologies/
    uxmethods-core.ttl         # curated ontology (TBox)
    workspace.ttl              # local entrypoint ontology for testing and development (imports only)
    catalog-v001.xml           # Protégé catalog: maps ontology IRIs -> local files
  queries/                     # SPARQL queries for testing & validation
  scripts/                     # tools for generating RDF and loading to Fuseki
  .env                         # local config (ignored)
  package.json
  README.md
```

**Source vs generated**

- Curated / versioned by hand: `ontologies/*`, `queries/*`, `scripts/*`
- Generated / replaceable: `build/*`

Treat `build/*` as disposable outputs: regenerate them from Sanity whenever content changes.

## IRIs and naming conventions

### IO taxonomy (SKOS)

- Concept Scheme IRI (slash): `https://uxmethods.org/taxonomies/io`
- Named graph IRI (slash): `https://uxmethods.org/taxonomies/io`
- Concept namespace (hash): `https://uxmethods.org/taxonomies/io#<conceptId>`

### Methods

- Method instance IRIs: `https://uxmethods.org/method/<slug>`

### Methods export ontology IRI

- Methods data ontology IRI: `https://uxmethods.org/graph/methods`

## Named graph strategy

Different “kinds” of knowledge in kept in separate **named graphs** so that each collection can:
- evolve schemas independently from content
- import/replace curated terms without touching core semantics
- load/unload entire domains of data cleanly
- write queries that target only the graph(s) they need

**Note:** IRIs identify resources globally; named graphs are storage context. A method can reference a SKOS concept by IRI even if its descriptive triples live in a different named graph.

## Local Protégé workflow

The most reliable way to work locally is to open one entrypoint ontology and let imports + a catalog resolve everything.

`workspace.ttl` imports:

- uxmethods-core ontology
- io-taxonomy export
- methods-data export

Protégé + the SPARQL plugin then behave like a "merged model over the imports closure", which works for iteration and testing.

### SPARQL behavior note

Protégé's SPARQL Query plugin typically queries a merged model (active ontology + imports closure), so you can write queries without `GRAPH {}` blocks locally. In Fuseki, you will usually need `GRAPH` unless you configure union default graph.

## Scripts

Your pnpm doesn't support `-C`, so use `pnpm --dir graph …` or `cd graph` first.

### Export methods (local file)

From repo root:

```bash
pnpm --dir graph exec node scripts/method-export.js
```

**Output:**

- `graph/build/methods-data.ttl`

### Export taxonomy + push to Fuseki

**Dry run (no PUT):**

```bash
DRY_RUN=1 pnpm --dir graph exec node scripts/push-io-taxonomy.js
```

**Write file + push to Fuseki:**

```bash
pnpm --dir graph exec node scripts/push-io-taxonomy.js
```

This does a Graph Store Protocol PUT to:

- `.../ds/data?graph=https://uxmethods.org/taxonomies/io`

with header:

- `X-API-Token: <FUSEKI_API_TOKEN>`

## Generated file requirements (Protégé-friendly)

Generated TTL files include an ontology header so Protégé can import them by logical IRI (not `file:`):

- `build/io-taxonomy.ttl` declares:
  - `<https://uxmethods.org/taxonomies/io> a owl:Ontology .`
- `build/methods-data.ttl` declares:
  - `<https://uxmethods.org/graph/methods> a owl:Ontology .`

This prevents Protégé's "Import using supplied physical URI (not recommended)" warning and enables clean catalog mappings.

## Queries

Queries live in `graph/queries/*.rq`. These are intended for:

- quick iteration in Protégé (copy/paste into SPARQL Query tab)
- later automation/regression tests against Fuseki

**Example (method output enables another method input):**

- `queries/method-output-enables-method-input*.rq`

## Troubleshooting

### Protégé import tries to fetch a web URL and fails

- Add `ontologies/catalog-v001.xml` under Protégé's Ontology Catalogs
- Ensure the imported files declare an `owl:Ontology` IRI (generated scripts now do this)

### Fuseki write returns 403 Forbidden

- nginx requires `X-API-Token`; confirm `FUSEKI_API_TOKEN` is set and the script sends the header
- confirm you're writing to `/ds/data` (not `/ds/`)

### Protégé still "sees" an import after you remove it

Protégé may keep ontologies loaded in memory for the session. Restart/reload if you need a clean imports-closure test.