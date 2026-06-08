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
import {emit} from './emit-mermaid'

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

/**
 * Build a Mermaid class-diagram from a compiled Studio schema. Never throws;
 * an unreadable schema yields `{mermaid: null, warnings: [reason]}`.
 */
export function buildDiagram(schema: Schema): DiagramResult {
  const {types, warning} = readSchemaSource(schema)
  if (warning) return {mermaid: null, warnings: [warning]}

  const model = walk(types)
  return {mermaid: emit(model), warnings: model.warnings}
}
