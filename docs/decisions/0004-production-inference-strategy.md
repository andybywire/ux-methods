# 0004 — Production inference strategy: query-time vs materialized

**Status:** proposed

## Context

The core ontology defines `uxm:hasUpstreamMethod` and `uxm:hasDownstreamMethod` as object properties with **OWL property-chain axioms** that derive them from `usesInput` / `producesOutput` plus shared SKOS concepts. A reasoner can therefore *infer* method-to-method dependencies rather than the application computing them by SPARQL join.

Two practical realities frame the decision:

- Plain RDFS inference does **not** apply OWL property chains. An OWL-capable regime (OWL RL or rules) is required.
- In Protégé, the **Snap SPARQL** plugin queries an inferred model and surfaces these entailments; the **built-in SPARQL tab** queries only asserted triples and misses them. The same fork exists in Fuseki: inference-at-query-time vs derived-graph materialization.

The application already has a working SPARQL-join formulation that computes upstream/downstream relationships and shared-concept weights from asserted triples — so we ship without inference if needed.

## Options

### A. Query-time inference in Fuseki

Configure `/ds` (or a sibling dataset) with an OWL-capable reasoner so `hasUpstreamMethod` / `hasDownstreamMethod` appear as entailments at query time.

**Pros**
- Semantically the cleanest demonstration — the ontology *is* the logic.
- No separate pipeline to maintain.

**Cons**
- Reasoning cost on every query.
- Entailment-regime choice matters (`OwlFBRuleReasoner`, OWL RL profile, custom rules) and changes performance characteristics.
- Harder to explain "why is method A upstream of method B" — the answer is "because of an entailment," which is correct but unhelpful to a UI.

### B. Materialized derived graph

A scheduled step computes upstream/downstream edges, weights, and (optionally) the concepts that caused each link, and writes them into a derived named graph (e.g. `https://uxmethods.org/graph/derived`). UI queries read asserted triples from that graph.

**Pros**
- Read queries are trivial and fast.
- "Why" is easy to surface — provenance is part of the materialized record.
- Cleanly composes with [ADR 0003](0003-explicit-graph-clauses.md).

**Cons**
- Another pipeline to keep in sync with content.
- The "semantics live in the data, not the ontology" framing is slightly weaker as a KG demonstration.

## Decision

**Not decided.** Both paths are viable; the project hasn't committed. When making suggestions in this area, weigh both honestly rather than defaulting.

Current leaning: option **B (materialized)** if performance or explainability becomes the binding constraint; option **A (query-time inference)** if the demonstration value of "the ontology produces the answers directly" outweighs operational simplicity. A pragmatic path is to ship B for product velocity and add A later as a parallel research dataset on `/ds-owl`.

## Consequences

Until this is resolved:

- Queries in shipped code must derive relationships from **asserted** predicates (`usesInput`/`producesOutput`).
- Don't write Astro queries that depend on `hasUpstreamMethod` / `hasDownstreamMethod` being available as triples in `/ds`.
- New work that would benefit from inference belongs in `/ds-owl` first, as an experiment, before any decision is committed.
