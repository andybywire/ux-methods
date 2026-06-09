import {describe, it, expect} from 'vitest'
import type {Schema} from 'sanity'

import {buildDiagram, modelFor, renderDiagram} from './build-diagram'
import {walk} from './walker'

function fakeSchema(types: unknown): Schema {
  return {_original: {name: 'test', types}} as unknown as Schema
}

describe('modelFor', () => {
  it('returns the walked model for a readable schema', () => {
    const {model} = modelFor(
      fakeSchema([{name: 'method', type: 'document', fields: [{name: 'title', type: 'string'}]}]),
    )
    expect(model?.classes.map((c) => c.name)).toEqual(['Method'])
  })

  it('returns a null model plus the guard warning for an unreadable schema', () => {
    const {model, warnings} = modelFor({} as unknown as Schema)
    expect(model).toBeNull()
    expect(warnings[0]).toMatch(/_original\.types/)
  })
})

describe('renderDiagram', () => {
  const model = walk([
    {
      name: 'method',
      type: 'document',
      fields: [
        {name: 'title', type: 'string'},
        {name: 'hero', type: 'heroImage'},
      ],
    },
    {name: 'heroImage', type: 'image', fields: []},
  ])

  it('renders the full model with no options', () => {
    const out = renderDiagram(model)
    expect(out).toContain('class Method')
    expect(out).toContain('class HeroImage')
    expect(out).toContain('+title: string')
  })

  it('hides named classes and their edges', () => {
    const out = renderDiagram(model, {hidden: new Set(['HeroImage'])})
    expect(out).not.toContain('class HeroImage')
    expect(out).not.toContain('Method *-- HeroImage')
  })

  it('omits field rows when attributes is false', () => {
    expect(renderDiagram(model, {attributes: false})).not.toContain('+title')
  })
})

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

  it('hides classes named in options.hidden (and their edges)', () => {
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
    const result = buildDiagram(schema, {hidden: new Set(['SkosConcept'])})
    expect(result.mermaid).toContain('class Method')
    expect(result.mermaid).not.toContain('class SkosConcept')
    expect(result.mermaid).not.toContain('Method --> SkosConcept')
  })

  it('omits field rows when attributes is false', () => {
    const schema = fakeSchema([
      {name: 'method', type: 'document', fields: [{name: 'title', type: 'string'}]},
    ])
    const result = buildDiagram(schema, {attributes: false})
    expect(result.mermaid).toContain('class Method')
    expect(result.mermaid).not.toContain('+title')
  })

  it('renders everything when no options are passed (backward compatible)', () => {
    const schema = fakeSchema([
      {name: 'method', type: 'document', fields: [{name: 'title', type: 'string'}]},
    ])
    expect(buildDiagram(schema).mermaid).toContain('+title: string')
  })
})
