# 0005 — Content-model export from Sanity schemas

**Status:** accepted

## Context

The Sanity Studio schemas in `studio/schemaTypes/` define the structure of UX Methods content — document types, shared object types, fields, references, validation rules. Today they exist only as TypeScript modules consumed by Sanity Studio. There is no holistic logical representation of the schema itself.

Two motivations push toward making the schema graph-visible:

- **Iteration and visualisation.** Lifting the schema out of TypeScript into a graph representation gives us a visual surface — class and property diagrams, hierarchy views, reasoner-backed consistency checks — for proposing schema changes and discussing them with collaborators. Cross-layer alignment with the curated ontology and SKOS taxonomy is a real future benefit, but only once a bridge file is added; it's not a motivation for this iteration.
- **Vendor-neutral demonstration.** Representing a content model in RDFS/OWL is itself a useful artefact: it states the structure of the content in a CMS-independent vocabulary, separable from Sanity's TS-module idiom.

The natural mapping is mostly straightforward — document types become classes, fields become properties — with one nuance worth recording: shared object *types* are also classes (their *instances* are the blank nodes in any future ABox export, but that's a content-export concern, not a schema-export one). Validation rules (`Rule.required()`, `Rule.max()`, regex patterns) are shape constraints rather than vocabulary, and properly belong in SHACL rather than OWL/RDFS.

## Decision

Generate a content-model TBox from the Sanity schema and treat it as a disposable artefact alongside the existing three layers in [ADR 0001](0001-three-layer-kg-separation.md).

- **File:** `graph/build/content-model.ttl` — generated, disposable, same "regenerate, don't edit" rule as the other `build/` artefacts.
- **Generator:** `graph/scripts/content-model-export.js`, driven by the JSON produced by `sanity manifest extract` rather than by importing the TS schemas directly.
- **Namespace:** `https://uxmethods.org/content-model/` — slash URIs, consistent with [ADR 0002](0002-uri-policy-hash-vs-slash.md)'s treatment of ontology terms. The name is deliberately CMS-neutral; the *generator* is Sanity-specific, the *vocabulary* it emits is not.
- **Vocabulary:** OWL/RDFS only.
  - Document types and object types → `owl:Class`.
  - Primitive fields → `owl:DatatypeProperty` with `rdfs:range` to an appropriate XSD datatype.
  - References and inline-object fields → `owl:ObjectProperty` with `rdfs:range` to the referenced or embedded class.
  - Single-valued fields → `owl:FunctionalProperty` where unambiguous; array fields carry no functional restriction.
- **Standalone, not folded into `workspace.ttl`.** The existing workspace merges layers that genuinely intermix (the curated ontology asserts axioms over SKOS concepts; methods reference SKOS concepts; inference straddles all three). Without a bridge, the content model and the curated ontology share no axioms — loading them into one Protégé project would put two parallel class hierarchies side-by-side with nothing connecting them, which obscures rather than clarifies. The exported file is self-contained (carries its own `owl:Ontology` header) and is opened directly in Protégé.
- **Deliberately out of scope for this iteration:**
  - **SHACL shapes.** Validation rules will eventually have a home, but the stated goal is iteration and visualisation in Protégé, where shape constraints are noise. Revisit when a real consumer (content linter, migration tool, editor-side validator) needs them.
  - **A bridge to the curated ontology.** A separate hand-curated file declaring equivalences between content-model classes and `uxm:` classes would let the two layers be queried together, but no near-term use case requires it. Using a distinct namespace from the start means adding the bridge later is purely additive — no IRI renames anywhere.
  - **CMS-specific extras** that don't map cleanly to vocabulary: conditional fields, `hidden`/`readOnly`, custom inputs, initial values, Portable Text mark types. Revisit with annotations or a CMS-extension namespace if a real need appears.

## Consequences

- The content model becomes visible in the graph layer, with the same regeneration discipline as the other generated artefacts. Hand-edits to `graph/build/content-model.ttl` will be overwritten; behavioural changes happen by editing Sanity schemas or the exporter.
- Sanity schema edits require re-running the exporter to refresh the graph view, the same way content edits already require re-running `method-export.js`.
- The existing `graph/ontologies/workspace.ttl` and Protégé catalog are **not** modified by this work; the content model is opened in Protégé as its own ontology. If a bridge file is added later, the bridge — not the content model itself — is what would join the two worlds, and it would import each side by logical IRI.
- The CMS-neutral namespace means a future bridge file — if one is ever needed — is the *only* place that has to know about Sanity specifically. The rest of the graph treats `content-model/Method` as "the document type" without caring how it was produced.
- No claim is made yet about whether the content-model layer is queried in production by Astro or by Fuseki consumers. For now it is a local-iteration and discussion artefact; promotion to a queried layer is a separate decision.
