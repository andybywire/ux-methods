import {describe, it, expect} from 'vitest'
import type {CanonicalModel} from './walker'
import {filterModel} from './filter-model'

function sampleModel(): CanonicalModel {
  return {
    classes: [
      {name: 'Method', stereotype: 'document', origin: 'document', fields: []},
      {name: 'HeroImage', stereotype: 'object', origin: 'image', fields: []},
      {name: 'Discipline', stereotype: 'document', origin: 'document', fields: []},
    ],
    edges: [
      {source: 'Method', target: 'HeroImage', relation: 'composition', fieldName: 'heroImage'},
      {source: 'Method', target: 'Discipline', relation: 'reference', fieldName: 'disciplines'},
    ],
    warnings: ['a modeling warning'],
  }
}

describe('filterModel', () => {
  it('removes hidden classes by name', () => {
    const result = filterModel(sampleModel(), new Set(['HeroImage']))
    expect(result.classes.map((c) => c.name)).toEqual(['Method', 'Discipline'])
  })

  it('drops edges whose target is hidden', () => {
    const result = filterModel(sampleModel(), new Set(['HeroImage']))
    expect(result.edges).toEqual([
      {source: 'Method', target: 'Discipline', relation: 'reference', fieldName: 'disciplines'},
    ])
  })

  it('drops edges whose source is hidden', () => {
    const result = filterModel(sampleModel(), new Set(['Method']))
    expect(result.edges).toEqual([])
  })

  it('is a no-op for an empty hidden set', () => {
    const model = sampleModel()
    expect(filterModel(model, new Set())).toEqual(model)
  })

  it('preserves warnings (filtering is a view choice, not a modeling change)', () => {
    expect(filterModel(sampleModel(), new Set(['HeroImage'])).warnings).toEqual([
      'a modeling warning',
    ])
  })

  it('does not mutate the input model', () => {
    const model = sampleModel()
    filterModel(model, new Set(['HeroImage', 'Method']))
    expect(model.classes).toHaveLength(3)
    expect(model.edges).toHaveLength(2)
  })
})
