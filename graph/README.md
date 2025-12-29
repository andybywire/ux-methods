# UX Methods Graph Data

This folder contains the knowledge graph assets for the UX Methods repository: ontologies, data, test fixtures, queries, and helper scripts.

The long-term goals of this work are to:
- maintain quality and consistency of UX Methods content over time
- generate semantically rich connections between resources that stay current as new resources and semantics are added
- expose a queryable endpoint (SPARQL) for interrogating the graph directly
- provide a foundation that can support graph-driven project planning tools (e.g., planners derived from methods, steps, artifacts, and dependencies)

## Folder structure
Built and proposed files and structure.

```
graph/
	ontologies/
		uxmethods-core.ttl
		uxmethods-shapes.ttl  # optional, recommended soon
		imports/              # pinned external ontology copies (optional)
		catalog-v001.xml      # Protégé import mapping for offline/reproducible builds
	test-data/
		mini-corpus.trig      # representative individuals for testing
	queries/
		infer-enables.construct.rq
		qa-orphans.rq
	scripts/
		validate-rdf.sh
		run-local-fuseki.sh
		load-ontology-graph.sh
	docs/
	README.md
```

## Conventions
- Shared semantics go in `/ontologies/` (e.g., `uxmethods-core.ttl`)
- Named-graph instance data goes in `/data/` as `.trig` (TriG supports multiple named graphs cleanly)
- Small, deterministic fixtures go in `/testdata/` for repeatable tests

### Base IRIs
- Core ontology namespace:
  - `https://uxmethods.org/ontologies/uxmethods-core#`
- Ontology version IRIs:
  - `https://uxmethods.org/ontologies/uxmethods-core/<version>`

### URI patterns
- Methods:
  - `https://uxmethods.org/method/<slug>`
- Taxonomy terms:
  - `https://uxmethods.org/taxonomies/<scheme>/<cui>`


## Named graph strategy

Different “kinds” of knowledge in kept in separate **named graphs** so that each collection can:
- evolve schemas independently from content
- import/replace curated terms without touching core semantics
- load/unload entire domains of data cleanly
- write queries that target only the graph(s) they need

### Core named graphs (proposed)

1. **Core ontology graph**
   - Graph IRI: `https://uxmethods.org/ontologies/uxmethods-core`
   - Contents: `/graph/ontologies/uxmethods-core.ttl` (and future ontologies)

2. **Curated taxonomy graph**
   - Graph IRI: `https://uxmethods.org/taxonomies/`
   - Contents: controlled concept schemes + terms (imported from Sanity)

3. **Curated content metadata graph**
   - Graph IRI: `https://uxmethods.org/content`
   - Contents: editorial metadata + relationships between resources/methods

4. **Operational provenance / event log graph (future)**
   - Graph IRI: `https://uxmethods.org/graph/prov`
   - Contents: PROV statements (imports, transformations, publishing events, QA checks)

5. **Project planning graph (future)**
   - Graph IRI: `https://uxmethods.org/projects`
   - Contents: studies/sessions/artifacts/dependencies for planning tools

> Note: named graphs are an implementation choice. Conceptually, the ontology applies across all graphs.

### File format guidance
- Prefer **TriG (`.trig`)** for datasets that contain multiple named graphs.
- Use **Turtle (`.ttl`)** for single-graph files (especially ontologies).

Example TriG skeleton:
```trig
@prefix uxm: <https://uxmethods.org/ontologies/uxmethods-core#> .
@prefix dct: <http://purl.org/dc/terms/> .

<https://uxmethods.org/content> {
  <https://uxmethods.org/method/usability-testing>
    a ux:Method ;
    dct:title "Usability Testing"@en .
}

<https://uxmethods.org/taxonomies> {
  <https://uxmethods.org/taxonomies/Mfji21/XvB1B0>
    a ux:Concept ;
    dct:title "Interface Usability"@en .
}