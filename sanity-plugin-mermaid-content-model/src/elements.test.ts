import {describe, it, expect} from 'vitest'
import type {CanonicalModel} from './walker'
import {defaultSelection, resolveElements, elementGroups} from './elements'

function sampleModel(): CanonicalModel {
  return {
    classes: [
      {name: 'Method', stereotype: 'document', origin: 'document', fields: []},
      {name: 'Discipline', stereotype: 'document', origin: 'document', fields: []},
      {name: 'HeroImage', stereotype: 'object', origin: 'image', fields: []},
      {name: 'Source', stereotype: 'object', origin: 'object', fields: []},
      {name: 'Metadata', stereotype: 'object', origin: 'inline', fields: []},
      {name: 'BodyPortableText', stereotype: 'object', origin: 'portableText', fields: []},
    ],
    edges: [],
    warnings: [],
  }
}

describe('defaultSelection', () => {
  it('defaults all categories to visible/on', () => {
    expect(defaultSelection(sampleModel()).categories).toEqual({
      inlineObjects: true,
      portableText: true,
      attributes: true,
    })
  })

  it('lists only individually-toggled classes (documents + named objects/images/files), all visible', () => {
    // inline + portableText classes are governed by their category toggle, not
    // listed individually — so they must NOT appear in the per-class map.
    expect(defaultSelection(sampleModel()).classes).toEqual({
      Method: true,
      Discipline: true,
      HeroImage: true,
      Source: true,
    })
  })
})

describe('elementGroups', () => {
  it('groups document classes and object/image/file classes, excluding inline + portableText', () => {
    expect(elementGroups(sampleModel())).toEqual({
      documents: ['Method', 'Discipline'],
      objects: ['HeroImage', 'Source'],
    })
  })
})

describe('resolveElements', () => {
  it('hides nothing and keeps attributes on for the default selection', () => {
    const model = sampleModel()
    const resolved = resolveElements(model, defaultSelection(model))
    expect([...resolved.hidden]).toEqual([])
    expect(resolved.attributes).toBe(true)
  })

  it('hides all inline-origin classes when the Inline objects category is off', () => {
    const model = sampleModel()
    const sel = defaultSelection(model)
    sel.categories.inlineObjects = false
    expect(resolveElements(model, sel).hidden.has('Metadata')).toBe(true)
  })

  it('hides all portableText-origin classes when the Portable Text Blocks category is off', () => {
    const model = sampleModel()
    const sel = defaultSelection(model)
    sel.categories.portableText = false
    expect(resolveElements(model, sel).hidden.has('BodyPortableText')).toBe(true)
  })

  it('hides an individual class when its per-class toggle is off', () => {
    const model = sampleModel()
    const sel = defaultSelection(model)
    sel.classes.HeroImage = false
    const resolved = resolveElements(model, sel)
    expect(resolved.hidden.has('HeroImage')).toBe(true)
    expect(resolved.hidden.has('Source')).toBe(false)
  })

  it('passes the attributes toggle through', () => {
    const model = sampleModel()
    const sel = defaultSelection(model)
    sel.categories.attributes = false
    expect(resolveElements(model, sel).attributes).toBe(false)
  })
})
