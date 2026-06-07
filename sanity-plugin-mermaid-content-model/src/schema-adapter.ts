// Adapter: Studio's compiled Schema → the raw type array the walker consumes.
//
// This is the one Sanity-coupled seam in the plugin's pipeline — the analogue
// of the CLI's `load-ts.ts` loader. Where the CLI imports
// `studio/schemaTypes/index.ts` directly (and so cannot see plugin-contributed
// types), the plugin receives the *fully-composed* workspace schema from
// Studio's `useSchema()`, which includes every plugin's types.
//
// `useSchema()` returns the compiled `Schema`. Its `_original.types` field
// holds the raw, authored `defineType` definitions that were merged (config +
// every plugin) before compilation — crucially, with their `validation`
// FUNCTIONS still intact, so the probe's cardinality introspection keeps
// working. The compiled `get()`/`getTypeNames()` API would expose the same
// type set, but with validation already resolved to specs — which would
// degrade cardinality to the precision `sanity schema extract` gives, the very
// thing ADR 0006 rejected. Hence we read `_original`.
//
// `_original` is marked `@internal` in @sanity/types: it is not part of
// Sanity's public API contract, so it could change without a semver-major bump
// or changelog note. We accept that risk knowingly (see ADR 0007) because it is
// the only source that is raw + validation-preserving + plugin-aware, it is set
// by the schema compiler as its canonical build-input, and Sanity's own runtime
// reads it. The `readSchemaSource` guard below bounds the downside: if the field
// ever disappears or changes shape, we degrade to an empty result plus a
// human-readable warning the tool surfaces — never a silent blank diagram or a
// crash.
//
// See ../../docs/decisions/0007-content-model-plugin-architecture.md.

import type {Schema, SchemaTypeDefinition} from 'sanity'

export interface SchemaSource {
  /**
   * Raw, authored type definitions to feed the walker. Empty when the schema
   * could not be read (see `warning`).
   */
  types: SchemaTypeDefinition[]
  /**
   * Human-readable diagnostic when the schema source could not be read as
   * expected, so the tool can surface it rather than silently rendering an
   * empty diagram. `null` on the happy path.
   */
  warning: string | null
}

const INTERNAL_SHAPE_WARNING =
  "Couldn't read the Studio schema's type definitions: `Schema._original.types` was missing or not an array. " +
  'This is an internal Sanity field the plugin depends on (see ADR 0007); the installed Sanity version may have ' +
  'changed its internal schema shape. The content-model diagram cannot be generated until the plugin is updated.'

/**
 * Read the raw, authored type definitions from a compiled Studio schema,
 * guarding the `@internal` `_original` access. Returns the types plus an
 * optional warning instead of throwing, so a future Sanity change degrades
 * visibly rather than catastrophically.
 */
export function readSchemaSource(schema: Schema): SchemaSource {
  const original = schema._original
  if (!original || !Array.isArray(original.types)) {
    return {types: [], warning: INTERNAL_SHAPE_WARNING}
  }
  if (original.types.length === 0) {
    return {types: [], warning: 'The Studio schema contains no types.'}
  }
  return {types: original.types, warning: null}
}
