# Architecture Decision Records

Short ADRs (architecture decision records) capturing significant choices about the UX Methods knowledge graph and surrounding infrastructure. Each entry records the context, the decision, and the consequences so future-you (or a collaborator) can understand *why* something is the way it is, not just *what* it is.

Format is intentionally lightweight: one decision per file, named `NNNN-kebab-title.md`. Status is one of `proposed`, `accepted`, `superseded`, `deprecated`. New entries get the next ordinal.

## Index

- [0001 — Three-layer KG separation (TBox / SKOS / ABox)](0001-three-layer-kg-separation.md) — *accepted*
- [0002 — URI policy: hash for taxonomy, slash for ontology and instances](0002-uri-policy-hash-vs-slash.md) — *accepted*
- [0003 — Explicit `GRAPH` clauses; no `unionDefaultGraph`](0003-explicit-graph-clauses.md) — *accepted*
- [0004 — Production inference strategy: query-time vs materialized](0004-production-inference-strategy.md) — *proposed*
- [0006 — Content-model export as a Mermaid class diagram](0006-content-model-mermaid-export.md) — *accepted* (supersedes 0005, which lives only on `archive/content-model-rdf`)
- [0007 — Content-model Mermaid plugin: in-monorepo first, extract later](0007-content-model-plugin-architecture.md) — *accepted*
