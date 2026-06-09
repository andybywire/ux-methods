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
import {walk, type CanonicalModel} from './walker'
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

export interface ModelResult {
  /** The unfiltered canonical model, or `null` when the schema couldn't be read. */
  model: CanonicalModel | null
  /** Schema-source guard warning (when model is null) or the walker's warnings. */
  warnings: string[]
}

/**
 * Read and walk a compiled Studio schema into the unfiltered canonical model.
 * The tool uses this to populate the Elements menu (and its default selection)
 * before any filtering. Never throws; an unreadable schema yields
 * `{model: null, warnings: [reason]}`.
 */
export function modelFor(schema: Schema): ModelResult {
  const {types, warning} = readSchemaSource(schema)
  if (warning) return {model: null, warnings: [warning]}
  const model = walk(types)
  return {model, warnings: model.warnings}
}

/**
 * Render a canonical model to a Mermaid string with the current view options
 * (filter → emit). Pure; the tool calls this on every Elements toggle, reusing
 * the already-walked model rather than re-reading the schema.
 */
export function renderDiagram(model: CanonicalModel, options: BuildDiagramOptions = {}): string {
  const filtered = filterModel(model, options.hidden ?? NOTHING_HIDDEN)
  // Resolve to a concrete boolean: exactOptionalPropertyTypes forbids passing
  // `undefined` to the optional `attributes?: boolean`.
  return emit(filtered, {attributes: options.attributes ?? true})
}

/**
 * Build a Mermaid class-diagram from a compiled Studio schema in one call —
 * the composed convenience over `modelFor` + `renderDiagram`. Never throws; an
 * unreadable schema yields `{mermaid: null, warnings: [reason]}`. Warnings are
 * the walker's (about the underlying model), unaffected by the view filter.
 */
export function buildDiagram(schema: Schema, options: BuildDiagramOptions = {}): DiagramResult {
  const {model, warnings} = modelFor(schema)
  if (model === null) return {mermaid: null, warnings}
  return {mermaid: renderDiagram(model, options), warnings}
}
