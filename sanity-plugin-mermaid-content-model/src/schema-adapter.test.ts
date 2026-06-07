import {describe, it, expect} from 'vitest'
import type {Schema} from 'sanity'

import {readSchemaSource} from './schema-adapter'
import {walk} from './walker'

/**
 * Minimal stand-in for the compiled Schema that `useSchema()` returns. The
 * adapter reads only `_original.types`, so we cast a partial object rather
 * than construct the full Schema (with its get/has/getTypeNames methods).
 * `types` is typed `unknown` so the guard cases can pass non-arrays.
 */
function fakeSchema(types: unknown): Schema {
  return {_original: {name: 'test', types}} as unknown as Schema
}

describe('readSchemaSource', () => {
  it('returns the raw type definitions from schema._original.types with no warning', () => {
    const types = [{name: 'method', type: 'document', fields: []}]
    const src = readSchemaSource(fakeSchema(types))
    // Same array reference — the adapter forwards, it does not copy.
    expect(src.types).toBe(types)
    expect(src.warning).toBeNull()
  })

  it('guards a missing _original (the @internal-field risk) with [] + a warning', () => {
    const src = readSchemaSource({} as unknown as Schema)
    expect(src.types).toEqual([])
    expect(src.warning).toMatch(/_original\.types/)
  })

  it('guards a non-array _original.types with [] + a warning', () => {
    const src = readSchemaSource(fakeSchema('not-an-array'))
    expect(src.types).toEqual([])
    expect(src.warning).toMatch(/_original\.types/)
  })

  it('warns (without erroring) when the schema legitimately has no types', () => {
    const src = readSchemaSource(fakeSchema([]))
    expect(src.types).toEqual([])
    expect(src.warning).toMatch(/no types/i)
  })

  it('feeds the walker so plugin-contributed types (e.g. skosConcept) reconnect', () => {
    // The CLI cannot see skosConcept — sanity-plugin-taxonomy-manager adds it
    // outside studio/schemaTypes/index.ts. useSchema()._original.types DOES
    // include it (verified: `sanity schema extract` lists skosConcept as a
    // resolved document type). This fixture mirrors the real method.topics slice.
    const schema = fakeSchema([
      {
        name: 'method',
        type: 'document',
        fields: [
          {name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'skosConcept'}]}]},
        ],
      },
      {name: 'skosConcept', type: 'document', fields: [{name: 'prefLabel', type: 'string'}]},
    ])
    const model = walk(readSchemaSource(schema).types)
    expect(model.classes.map((c) => c.name)).toContain('SkosConcept')
    expect(model.edges).toContainEqual({
      source: 'Method',
      target: 'SkosConcept',
      relation: 'reference',
      fieldName: 'topics',
    })
  })
})
