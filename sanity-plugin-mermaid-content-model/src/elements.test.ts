import {describe, it, expect} from 'vitest'
import type {CanonicalModel} from './walker'
import {defaultSelection, resolveElements, elementGroups, orphanObjects} from './elements'

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
    // Method composes all four objects, so by default (Method visible) they are
    // all reachable. Discipline composes nothing.
    edges: [
      {source: 'Method', target: 'HeroImage', relation: 'composition', fieldName: 'heroImage'},
      {source: 'Method', target: 'Source', relation: 'composition', fieldName: 'source'},
      {source: 'Method', target: 'Metadata', relation: 'composition', fieldName: 'metadata'},
      {source: 'Method', target: 'BodyPortableText', relation: 'composition', fieldName: 'body'},
    ],
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

  it('auto-hides dependent inline/portable-text classes when their document is hidden', () => {
    const model = sampleModel()
    const sel = defaultSelection(model)
    sel.classes.Method = false // hide the only document composing the objects
    const resolved = resolveElements(model, sel)
    // Inline + portable-text follow their parent out of view, even though their
    // category toggle is still on.
    expect(resolved.hidden.has('Metadata')).toBe(true)
    expect(resolved.hidden.has('BodyPortableText')).toBe(true)
    // Named object/image/file classes are NOT auto-hidden here — they float as
    // orphans for the user to hide via the button.
    expect(resolved.hidden.has('HeroImage')).toBe(false)
    expect(resolved.hidden.has('Source')).toBe(false)
  })
})

describe('orphanObjects', () => {
  // Reachability fixture. Method composes HeroImage and (via BodyPortableText)
  // BodyImage; Resource composes Publisher; Newsletter references Resource;
  // Lonely is used by nobody; InlineThing is an inline object (never eligible).
  function orphanFixture(): CanonicalModel {
    return {
      classes: [
        {name: 'Method', stereotype: 'document', origin: 'document', fields: []},
        {name: 'Newsletter', stereotype: 'document', origin: 'document', fields: []},
        {name: 'Resource', stereotype: 'document', origin: 'document', fields: []},
        {name: 'HeroImage', stereotype: 'object', origin: 'image', fields: []},
        {name: 'BodyPortableText', stereotype: 'object', origin: 'portableText', fields: []},
        {name: 'BodyImage', stereotype: 'object', origin: 'object', fields: []},
        {name: 'Publisher', stereotype: 'object', origin: 'object', fields: []},
        {name: 'Lonely', stereotype: 'object', origin: 'object', fields: []},
        {name: 'InlineThing', stereotype: 'object', origin: 'inline', fields: []},
      ],
      edges: [
        {source: 'Method', target: 'HeroImage', relation: 'composition', fieldName: 'heroImage'},
        {source: 'Method', target: 'BodyPortableText', relation: 'composition', fieldName: 'body'},
        {source: 'BodyPortableText', target: 'BodyImage', relation: 'composition', fieldName: 'img'},
        {source: 'Resource', target: 'Publisher', relation: 'composition', fieldName: 'publisher'},
        {source: 'Newsletter', target: 'Resource', relation: 'reference', fieldName: 'resources'},
      ],
      warnings: [],
    }
  }

  it('reports only truly-unreachable objects when everything is visible', () => {
    const model = orphanFixture()
    // HeroImage, BodyImage (via BodyPortableText), and Publisher are all
    // reachable from a visible document; only Lonely is unreached. InlineThing
    // is inline (not eligible) even though it's unreachable.
    expect(orphanObjects(model, defaultSelection(model))).toEqual(['Lonely'])
  })

  it('treats documents as boundaries: hiding Resource orphans Publisher', () => {
    const model = orphanFixture()
    const sel = defaultSelection(model)
    sel.classes.Resource = false
    const orphans = orphanObjects(model, sel)
    // Newsletter --> Resource stops at the hidden Resource, so Publisher is unreached.
    expect(orphans).toContain('Publisher')
    // Objects a visible document reaches (directly or through an object) are not orphans.
    expect(orphans).not.toContain('HeroImage')
    expect(orphans).not.toContain('BodyImage')
  })

  it('does not report objects that are already hidden (only visible orphans count)', () => {
    const model = orphanFixture()
    const sel = defaultSelection(model)
    sel.classes.Lonely = false
    expect(orphanObjects(model, sel)).toEqual([])
  })

  it('never reports inline or portable-text objects, even when unreachable', () => {
    const model = orphanFixture()
    const sel = defaultSelection(model)
    // Hide every document → nothing is reachable.
    sel.classes.Method = false
    sel.classes.Newsletter = false
    sel.classes.Resource = false
    const orphans = orphanObjects(model, sel)
    expect(orphans).not.toContain('InlineThing')
    expect(orphans).not.toContain('BodyPortableText')
    // All visible object/image/file classes become orphans, in model order.
    expect(orphans).toEqual(['HeroImage', 'BodyImage', 'Publisher', 'Lonely'])
  })

  it('strands a named object reachable only through a hidden Portable Text block', () => {
    const model = orphanFixture()
    const sel = defaultSelection(model)
    sel.categories.portableText = false // BodyPortableText hidden → stops conducting
    const orphans = orphanObjects(model, sel)
    expect(orphans).toContain('BodyImage') // only reached via the hidden PT block
    expect(orphans).not.toContain('HeroImage') // still directly reachable from Method
  })

  it('strands a named object reachable only through a hidden inline object', () => {
    const model: CanonicalModel = {
      classes: [
        {name: 'Doc', stereotype: 'document', origin: 'document', fields: []},
        {name: 'InlineWrap', stereotype: 'object', origin: 'inline', fields: []},
        {name: 'WrappedObj', stereotype: 'object', origin: 'object', fields: []},
      ],
      edges: [
        {source: 'Doc', target: 'InlineWrap', relation: 'composition', fieldName: 'wrap'},
        {source: 'InlineWrap', target: 'WrappedObj', relation: 'composition', fieldName: 'obj'},
      ],
      warnings: [],
    }
    const sel = defaultSelection(model)
    expect(orphanObjects(model, sel)).not.toContain('WrappedObj') // visible inline conducts
    sel.categories.inlineObjects = false // InlineWrap hidden → stops conducting
    expect(orphanObjects(model, sel)).toContain('WrappedObj')
  })
})
