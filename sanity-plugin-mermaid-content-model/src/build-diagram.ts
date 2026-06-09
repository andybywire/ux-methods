// Orchestration: compiled Studio Schema → Mermaid diagram string + warnings.
//
// The in-Studio analogue of the CLI's `generate`, minus all I/O: it composes
// the same pure pipeline (read schema source → walk → emit) into one call the
// tool's React component can render directly. Keeping this logic here — pure
// and fully unit-tested — lets the component stay a thin renderer that needs no
// DOM-level testing of the diagram logic.
//
// See ../../docs/decisions/0007-content-model-plugin-architecture.md.

import type {Schema} from 'sanity'

import {readSchemaSource} from './schema-adapter'
import {walk} from './walker'
import {filterModel} from './filter-model'
import {emit} from './emit-mermaid'

const NOTHING_HIDDEN: ReadonlySet<string> = new Set()

export interface DiagramResult {
  /**
   * The Mermaid `classDiagram` source, ready to hand to a renderer. `null` when
   * the schema source could not be read at all (see `warnings`) — the tool
   * should show the warning rather than an empty canvas.
   */
  mermaid: string | null
  /**
   * Diagnostics to surface alongside the diagram: the schema-source guard
   * warning (blocking — pairs with `mermaid: null`), or the walker's
   * non-blocking modeling warnings (dropped edges, field-name reuse) that
   * accompany a rendered diagram.
   */
  warnings: string[]
}

export interface BuildDiagramOptions {
  /**
   * Class names to hide from the diagram, as resolved from the Elements menu.
   * Edges touching a hidden class are dropped. Defaults to hiding nothing.
   */
  hidden?: ReadonlySet<string>
  /**
   * When false, class boxes render without field rows (the "Attributes"
   * toggle). Default true.
   */
  attributes?: boolean
}

/**
 * Build a Mermaid class-diagram from a compiled Studio schema, applying the
 * current Elements-menu view options. Never throws; an unreadable schema yields
 * `{mermaid: null, warnings: [reason]}`.
 *
 * Pipeline: read schema source → walk → filter (hide classes) → emit. Warnings
 * are the walker's (about the underlying model), unaffected by the view filter.
 */
export function buildDiagram(schema: Schema, options: BuildDiagramOptions = {}): DiagramResult {
  const {types, warning} = readSchemaSource(schema)
  if (warning) return {mermaid: null, warnings: [warning]}

  const model = filterModel(walk(types), options.hidden ?? NOTHING_HIDDEN)
  // Resolve to a concrete boolean: exactOptionalPropertyTypes forbids passing
  // `undefined` to the optional `attributes?: boolean`.
  return {mermaid: emit(model, {attributes: options.attributes ?? true}), warnings: model.warnings}
}
