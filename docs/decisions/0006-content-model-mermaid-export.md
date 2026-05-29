# 0006 — Content-model export as a Mermaid class diagram

**Status:** accepted

**Supersedes:** ADR 0005 — Content-model export from Sanity schemas (lives on branch [`archive/content-model-rdf`](https://github.com/) only; never merged to `main`).

## Context

The Sanity Studio schemas in `studio/schemaTypes/` define the structure of UX Methods content — document types, shared object types, fields, references. There is value in lifting that structure into a holistic, visual representation that:

- **Tracks schema drift over time** through the git history of a generated artefact.
- **Distinguishes documents from shared objects** — the entity-with-identity vs compositional-value-object distinction that Sanity actually models.
- **Shows references, composition, and field-level types with cardinality**.
- **Renders in tools already in our workflow** — GitHub markdown, [mermaid.live](https://mermaid.live), [mermaid.ai](https://mermaid.ai).

ADR 0005 attempted this as an OWL/RDFS export aimed at Protégé. In practice, RDFS makes everything an `owl:Class` and flattens the document/object distinction into a single class hierarchy. That is a paradigm mismatch with what the artefact is trying to communicate, not a tooling shortcoming — the RDF/OWL vocabulary genuinely does not have a first-class way to say "this kind of thing has its own identity and lives at a top-level URL; this other kind is always embedded in something else."

Mermaid's `classDiagram` syntax is purpose-built for exactly this structural-visualisation job. Stereotypes mark the document/object distinction, composition diamonds mark embedded objects, association arrows mark references, cardinality sits on the lines, and `classDef` styles each stereotype distinctly.

The RDF exploration is preserved on `archive/content-model-rdf` (including ADR 0005 itself); this ADR does not delete that work, it reframes the problem.

## Decision

Generate the content model as a Mermaid `classDiagram` and commit it to the repo.

### Output

- **File:** `docs/content-model.md` — committed, **not** gitignored. The drift-tracking story is the file's *git history*; that is the value here, distinct from how `graph/build/*` artefacts are treated.
- **Format:** a single fenced ```` ```mermaid ```` code block so the diagram renders inline on GitHub.

### Vocabulary mapping

- **Stereotypes**
  - Document types → `<<document>>`, styled blue: `classDef document fill:#1976d2,color:#fff`.
  - Object types → `<<object>>`, styled grey: `classDef object fill:#757575,color:#fff`.
- **Fields and relationships**
  - Primitive field → `+ fieldName: type [cardinality]` inside the class body.
  - Inline object field → `Parent *-- Child` (composition; filled diamond).
  - Reference field → `Parent --> Target` (association; arrow).
  - Portable Text → field-line type label only (`+ overview: PortableText [0..1]`); no `PortableText` class emitted.
  - Image-typed objects → emitted as object classes containing **only user-added fields** (`caption`, `alt`, etc.); Sanity-internal `asset` / `hotspot` / `crop` / `media` are skipped.
- **Cardinality** is derived from `optional` plus array status:

  | Required | Array | Cardinality |
  |---|---|---|
  | yes | no | `1` |
  | no | no | `0..1` |
  | yes | yes | `1..*` |
  | no | yes | `0..*` |

  Cardinality on a diagram is information design, not runtime validation — it is fine to include here even though ADR 0005 deferred SHACL constraints. The diagram is not a constraint surface.

### Type-name skips

Match the exclusion logic of the archived RDF generator:

- Patterns: `/^sanity\./`, `/^assist\./`, `/^geopoint$/`.
- `X.reference` wrapper types are unwrapped so the field points at `X` directly.
- `slug` is treated as `string` at field sites; no class is emitted.
- Platform metadata fields are skipped everywhere: `_id`, `_type`, `_createdAt`, `_updatedAt`, `_rev`, `_key`, `_weak`.
- Validation rules, `hidden`/`readOnly`/`initialValue`, conditional fields, and custom inputs are not represented.

### Generator

- **Location:** `graph/scripts/content-model-mermaid-export.js`. Match the style of `method-export.js` and `io-taxonomy-export.js` in the same directory.
- **Input:** `sanity schema extract --workspace production`, invoked as a subprocess with `cwd: studio/`. Output is the `groq-type-nodes` JSON format Sanity TypeGen consumes.
- **Intermediate file:** `graph/build/_sanity-schema.json` (gitignored), cleaned up after each run unless `KEEP_INTERMEDIATE=1` is set.
- **npm script:** `export:content-model` in `graph/package.json`, alongside `push:io-taxonomy` and `push:methods`.
- **Sanity CLI quirk:** `--path` is treated as relative to the CLI's cwd. When invoking from `graph/` with `cwd: studio/`, pass the output path relative to `studio/` (e.g. `../graph/build/_sanity-schema.json`). Working subprocess wiring exists on `archive/content-model-rdf` and can be lifted.

### Visual grouping

Mermaid `classDiagram` does not support `subgraph`. The Miro mockup's "Core Resource Types" vs "Shared Objects" grouping is conveyed implicitly through the stereotype fill colour. No `direction` hint is added.

### Deliberately out of scope

- **OWL/RDFS export.** Superseded by this ADR. If a vocabulary-level demonstration of the schema becomes useful later, it can return as a separate artefact rather than as the primary representation.
- **A bridge to the curated ontology.** Mermaid is a visualisation, not a queryable vocabulary; there is nothing to bridge.
- **SHACL shapes.** Still deferred for the same reasons as in ADR 0005.

## Consequences

- The content model lives in `docs/`, not `graph/build/`, because the file is itself an authored artefact whose history matters. It is **not** treated as disposable, even though it is generated; regenerating overwrites the working copy, and the git diff is the point.
- Sanity schema edits require re-running the exporter to keep `docs/content-model.md` honest. A drift between schema and committed diagram is detectable in PR review.
- This artefact sits **parallel to** the three KG layers in [ADR 0001](0001-three-layer-kg-separation.md), not inside any of them. It does not participate in inference, is not pushed to Fuseki, and is not imported into `workspace.ttl`.
- Field-name collisions across document types (e.g. `documentation.body` as Portable Text vs `newsletter.body` as plain string — surfaced by the RDF generator on the archive branch) disappear in this approach because Mermaid does not unify fields across classes. Each class shows its own field set. The exporter should still warn on a collision if encountered, but it does not block emission.
- ADR 0005 is superseded but not deleted. The branch `archive/content-model-rdf` retains the original ADR, generator, and namespace decisions for reference.
