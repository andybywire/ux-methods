// Emitter: CanonicalModel → Mermaid classDiagram string.
//
// Pure function. Produces deterministic output suitable for committing
// directly to docs/content-model.md. Consumes the canonical model from
// walker.ts; downstream of every interpretation decision (cardinality,
// custom marker, edge relation) — this module is purely presentational.
//
// See ../../docs/decisions/0006-content-model-mermaid-export.md for the
// rendering contract.

import type {
  CanonicalClass,
  CanonicalField,
  CanonicalModel,
  Cardinality,
  Edge,
  FieldChar,
} from './walker'

const INDENT = '  '
const DOCUMENT_STYLE = 'fill:#2276FC,stroke:#7AACFD,color:#fff'
const OBJECT_STYLE = 'fill:#7B8CA8,stroke:#AFBACA,color:#fff'

/**
 * Render a field's cardinality bracket: `[1]`, `[0..1]`, `[1..*]`, `[2..5]`,
 * with an optional `, custom` suffix when the field has validation the
 * diagram can't fully render in detail.
 */
export function renderCardinality(c: Cardinality, hasCustomMarker: boolean): string {
  const marker = hasCustomMarker ? ', custom' : ''
  return `[${renderCardinalityCore(c)}${marker}]`
}

function renderCardinalityCore(c: Cardinality): string {
  if (c.max === '*') return `${c.min}..*`
  if (c.min === c.max) return String(c.min)
  return `${c.min}..${c.max}`
}

/**
 * The type label shown after the colon in a field line. For primitives,
 * the lowercase Sanity type name; for portable text, `PortableText`; for
 * object kinds, the target class name (which is itself pascal-cased by the
 * walker).
 */
export function fieldTypeLabel(char: FieldChar): string {
  if (char.kind === 'primitive') return char.prim
  if (char.kind === 'portableText') return 'PortableText'
  return char.target // object
}

/**
 * Render a single field line, e.g. `+title: string [1]` or
 * `+overview: PortableText [0..1, custom]`. No indentation — the caller
 * (renderClass) adds whatever indentation the enclosing block needs.
 */
export function renderField(field: CanonicalField): string {
  const label = fieldTypeLabel(field.char)
  const card = renderCardinality(field.cardinality, field.hasCustomMarker)
  return `+${field.name}: ${label} ${card}`
}

/**
 * Render a class block. The opening line uses Mermaid's `:::stereotype`
 * operator to apply the matching classDef styling at declaration time —
 * this is the actual Mermaid syntax for "style this class with that
 * styleClass" (the standalone form `class Name stereotype` is a
 * different statement that creates a new class called `Namestereotype`).
 * The `<<stereotype>>` annotation inside the body is independent: it's
 * what produces the visible `«document»` / `«object»` text label above
 * the class name.
 */
export function renderClass(cls: CanonicalClass): string[] {
  const lines: string[] = []
  lines.push(`${INDENT}class ${cls.name}:::${cls.stereotype} {`)
  lines.push(`${INDENT}${INDENT}<<${cls.stereotype}>>`)
  for (const f of cls.fields) {
    lines.push(`${INDENT}${INDENT}${renderField(f)}`)
  }
  lines.push(`${INDENT}}`)
  return lines
}

/**
 * Render an edge as a single Mermaid line. Composition uses the filled
 * diamond (`*--`); reference uses the simple association arrow (`-->`).
 * The field name appears as the edge label after `:`.
 */
export function renderEdge(edge: Edge): string {
  const arrow = edge.relation === 'composition' ? '*--' : '-->'
  return `${INDENT}${edge.source} ${arrow} ${edge.target} : ${edge.fieldName}`
}

/**
 * Produce a complete Mermaid `classDiagram` block for the given canonical
 * model. Structure: header, every class block, every edge, two classDef
 * style definitions (document, object), then one style assignment per
 * emitted class.
 *
 * Output is a single string with newline separators — no trailing newline.
 * The caller wraps it in a fenced ```mermaid``` block when writing to .md.
 */
export function emit(model: CanonicalModel): string {
  const lines: string[] = ['classDiagram']
  for (const cls of model.classes) lines.push(...renderClass(cls))
  for (const edge of model.edges) lines.push(renderEdge(edge))
  // classDef declarations are intentionally placed at the END of the
  // diagram, after all class declarations and edges. The Mermaid spec
  // doesn't mandate position, and the parser resolves `:::stereotype`
  // forward references either way — but mermaidviewer.com empirically
  // ignores classDef fills when they appear before the classes that
  // reference them. Putting them last gives consistent rendering across
  // mermaidviewer, mermaid.live, and GitHub markdown.
  lines.push(`${INDENT}classDef document ${DOCUMENT_STYLE}`)
  lines.push(`${INDENT}classDef object ${OBJECT_STYLE}`)
  return lines.join('\n')
}
