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

/** The fill / stroke / text colours for one stereotype's class boxes. */
export interface ClassPalette {
  fill: string
  stroke: string
  text: string
}

/**
 * Document and object palettes for a diagram's `classDef` lines. The box colours
 * are baked into the emitted Mermaid source (so the code stays self-contained
 * and portable); light/dark for edges, labels, and background come from
 * mermaid's named base theme, set by `MermaidView`.
 *
 * `LIGHT_THEME` / `DARK_THEME` are the source of truth — tweak box colours there.
 */
export interface DiagramTheme {
  document: ClassPalette
  object: ClassPalette
}

/**
 * Light palette — also the default, matching the original committed colours.
 * Distinguishes documents (blue) from objects (slate).
 */
export const LIGHT_THEME: DiagramTheme = {
  document: {fill: '#2276FC', stroke: '#7AACFD', text: '#fff'},
  object: {fill: '#7B8CA8', stroke: '#AFBACA', text: '#fff'},
}

/**
 * Dark palette — deeper fills / lighter strokes that read on a dark canvas,
 * keeping the document-blue vs object-slate distinction. Tunable.
 */
export const DARK_THEME: DiagramTheme = {
  document: {fill: '#2563EB', stroke: '#60A5FA', text: '#fff'},
  object: {fill: '#475569', stroke: '#94A3B8', text: '#fff'},
}

const paletteToStyle = (p: ClassPalette): string =>
  `fill:${p.fill},stroke:${p.stroke},color:${p.text}`

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
export function renderClass(cls: CanonicalClass, showAttributes = true): string[] {
  const lines: string[] = []
  lines.push(`${INDENT}class ${cls.name}:::${cls.stereotype} {`)
  lines.push(`${INDENT}${INDENT}<<${cls.stereotype}>>`)
  if (showAttributes) {
    for (const f of cls.fields) {
      lines.push(`${INDENT}${INDENT}${renderField(f)}`)
    }
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

export interface EmitOptions {
  /**
   * When false, class boxes render without their field rows — the "Attributes"
   * toggle in the Elements menu. Relationships (edges) and the stereotype tag
   * still render. Default true.
   */
  attributes?: boolean
  /**
   * Document/object colour palette for the `classDef` lines. Defaults to
   * `LIGHT_THEME`. The tool passes `DARK_THEME` when Studio is in dark mode.
   */
  theme?: DiagramTheme
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
export function emit(model: CanonicalModel, options: EmitOptions = {}): string {
  const showAttributes = options.attributes ?? true
  const theme = options.theme ?? LIGHT_THEME
  const lines: string[] = ['classDiagram']
  for (const cls of model.classes) lines.push(...renderClass(cls, showAttributes))
  for (const edge of model.edges) lines.push(renderEdge(edge))
  // classDef declarations are intentionally placed at the END of the
  // diagram, after all class declarations and edges. The Mermaid spec
  // doesn't mandate position, and the parser resolves `:::stereotype`
  // forward references either way — but mermaidviewer.com empirically
  // ignores classDef fills when they appear before the classes that
  // reference them. Putting them last gives consistent rendering across
  // mermaidviewer, mermaid.live, and GitHub markdown.
  lines.push(`${INDENT}classDef document ${paletteToStyle(theme.document)}`)
  lines.push(`${INDENT}classDef object ${paletteToStyle(theme.object)}`)
  return lines.join('\n')
}
