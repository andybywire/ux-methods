# 0002 — URI policy: hash for taxonomy, slash for ontology and instances

**Status:** accepted

## Context

The project mints IRIs for three different kinds of resources: SKOS concepts in the IO taxonomy, ontology terms (classes and properties), and method instances. Picking hash (`…#term`) vs slash (`…/term`) URIs has implications for HTTP dereferenceability, partitioning of triples on the web, and how Fuseki named graphs line up with scheme IRIs.

## Decision

Use a **mixed** strategy:

- **Taxonomy (SKOS concepts):** **hash URIs.**
  - Concept scheme IRI: `https://uxmethods.org/taxonomies/io`
  - Concept IRIs: `https://uxmethods.org/taxonomies/io#<conceptId>`
  - The concept-scheme IRI doubles as the Fuseki **named graph IRI** for the taxonomy. They intentionally match.
- **Ontology terms (classes, properties):** **slash URIs** under an ontology namespace (current canonical: `https://uxmethods.org/ontologies/uxmethods-core#…`; an older `https://uxmethods.org/ontology/…` namespace is still present in some live data and is part of the alignment cleanup).
- **Method instances:** **slash URIs**, e.g. `https://uxmethods.org/method/<Slug>`.

## Consequences

- **One HTTP fetch returns the entire taxonomy.** Hash URIs share a base document, which is appropriate for SKOS — concepts are usually consumed as a set.
- **Named-graph IRI doubles as scheme IRI.** Writers and queries can refer to the same string for both purposes, reducing the chance of drift.
- **Methods and ontology terms can dereference individually** when slash URIs are eventually backed by per-resource HTTP responses.
- **The mixed model is acceptable and intentional.** Don't "normalize" one side to match the other on aesthetic grounds.
- **Predicate-namespace drift exists today.** The live Astro query uses an older `…/ontology/…` namespace; the curated ontology uses `…/ontologies/uxmethods-core#…`. Aligning these is tracked in the infrastructure cleanup backlog, not by changing the policy here.
