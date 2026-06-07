import {definePlugin} from 'sanity'

/**
 * Sanity Studio plugin that renders the Studio's content model as a Mermaid
 * class diagram, inside Studio.
 *
 * Phase 1 scaffold: this entry registers the plugin but contributes nothing
 * yet. The schema adapter (`useSchema()` → walker input) and the tool UI
 * land in subsequent TDD cycles. The pure `probe` / `walker` / `emitMermaid`
 * modules are copied from the `content-model/` CLI and exported here so they
 * can be exercised independently.
 *
 * See ../../docs/decisions/0007-content-model-plugin-architecture.md and
 * ../../docs/decisions/0006-content-model-mermaid-export.md.
 */
export const mermaidContentModel = definePlugin(() => ({
  name: 'sanity-plugin-mermaid-content-model',
}))

export {walk} from './walker'
export {emit} from './emit-mermaid'
export {probe} from './probe'
export {readSchemaSource} from './schema-adapter'
export type {SchemaSource} from './schema-adapter'
export type {
  CanonicalModel,
  CanonicalClass,
  CanonicalField,
  Edge,
  FieldChar,
  Cardinality,
  Stereotype,
  ClassOrigin,
} from './walker'
