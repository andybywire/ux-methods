import {describe, it, expect} from 'vitest'
import type {Schema} from 'sanity'

import {buildDiagram} from './build-diagram'

function fakeSchema(types: unknown): Schema {
  return {_original: {name: 'test', types}} as unknown as Schema
}

describe('buildDiagram', () => {
  it('renders a Mermaid classDiagram string for a valid schema', () => {
    const result = buildDiagram(
      fakeSchema([{name: 'discipline', type: 'document', fields: [{name: 'title', type: 'string'}]}]),
    )
    expect(result.mermaid).toContain('classDiagram')
    expect(result.mermaid).toContain('class Discipline')
    expect(result.warnings).toEqual([])
  })

  it('returns mermaid: null plus the guard warning when the schema source is unreadable', () => {
    const result = buildDiagram({} as unknown as Schema)
    expect(result.mermaid).toBeNull()
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toMatch(/_original\.types/)
  })

  it('reconnects plugin-contributed types end to end (skosConcept)', () => {
    const result = buildDiagram(
      fakeSchema([
        {
          name: 'method',
          type: 'document',
          fields: [
            {name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'skosConcept'}]}]},
          ],
        },
        {name: 'skosConcept', type: 'document', fields: [{name: 'prefLabel', type: 'string'}]},
      ]),
    )
    expect(result.mermaid).toContain('class SkosConcept')
    expect(result.mermaid).toContain('Method --> SkosConcept')
    expect(result.warnings).toEqual([])
  })

  it('surfaces non-blocking walker warnings while still returning a diagram', () => {
    // A reference to a skipped type (sanity.imageAsset) drops the edge and warns,
    // but the diagram still renders.
    const result = buildDiagram(
      fakeSchema([
        {
          name: 'method',
          type: 'document',
          fields: [{name: 'preview', type: 'reference', to: [{type: 'sanity.imageAsset'}]}],
        },
      ]),
    )
    expect(result.mermaid).toContain('class Method')
    expect(result.warnings.some((w) => w.includes("'preview'"))).toBe(true)
  })
})
