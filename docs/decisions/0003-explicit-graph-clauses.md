# 0003 — Explicit `GRAPH` clauses; no `unionDefaultGraph`

**Status:** accepted

## Context

The `/ds` dataset in Fuseki stores the IO taxonomy in a named graph (`https://uxmethods.org/taxonomies/io`) and method data in (effectively) the default graph. TDB2 supports a `tdb2:unionDefaultGraph` flag that, when enabled, exposes the union of all named graphs and the default graph as the default for queries — which lets queries omit `GRAPH { … }` blocks and still see everything.

That ergonomic win comes at the cost of explicitness: queries no longer say *which* graph they touch, and silent behavioural changes can sneak in as new named graphs are loaded.

## Decision

Keep `tdb2:unionDefaultGraph` **disabled** (its current state on `/ds`). Queries that need taxonomy triples wrap their patterns in:

```sparql
GRAPH <https://uxmethods.org/taxonomies/io> {
  …
}
```

## Consequences

- **Queries are debuggable and predictable.** It's always clear from the query text which graphs are involved.
- **No accidental joins** across graphs that happen to share predicates.
- **Slightly more typing per query** — acceptable tradeoff.
- **Future-friendly.** When a derived graph (e.g. `https://uxmethods.org/graph/derived` from [ADR 0004](0004-production-inference-strategy.md)) is introduced, this stance scales without revisiting every existing query.
- **Reconsider only when query ergonomics start to hurt.** If patterns repeatedly need `GRAPH` blocks for three or more graphs in routine queries, revisit. Until then, the explicitness wins.
