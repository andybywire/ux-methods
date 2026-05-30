import {describe, it, expect} from 'vitest'
import {
  emit,
  fieldTypeLabel,
  renderCardinality,
  renderClass,
  renderEdge,
  renderField,
} from './emit-mermaid.ts'
import {walk} from './walker.ts'
import type {CanonicalField} from './walker.ts'

describe('renderCardinality', () => {
  it('renders a required scalar as [1]', () => {
    expect(renderCardinality({min: 1, max: 1}, false)).toBe('[1]')
  })

  it('renders an optional scalar as [0..1]', () => {
    expect(renderCardinality({min: 0, max: 1}, false)).toBe('[0..1]')
  })

  it('renders a required array as [1..*]', () => {
    expect(renderCardinality({min: 1, max: '*'}, false)).toBe('[1..*]')
  })

  it('renders an optional array as [0..*]', () => {
    expect(renderCardinality({min: 0, max: '*'}, false)).toBe('[0..*]')
  })

  it('renders a bounded array as [n..m]', () => {
    expect(renderCardinality({min: 2, max: 5}, false)).toBe('[2..5]')
  })

  it('appends a "custom" marker to a scalar cardinality', () => {
    expect(renderCardinality({min: 1, max: 1}, true)).toBe('[1, custom]')
  })

  it('appends a "custom" marker to an array cardinality', () => {
    expect(renderCardinality({min: 0, max: '*'}, true)).toBe('[0..*, custom]')
  })
})

describe('fieldTypeLabel', () => {
  it('renders a string primitive as "string"', () => {
    expect(fieldTypeLabel({kind: 'primitive', prim: 'string', array: false})).toBe('string')
  })

  it('renders a url primitive as "url"', () => {
    expect(fieldTypeLabel({kind: 'primitive', prim: 'url', array: false})).toBe('url')
  })

  it('renders portable text as "PortableText"', () => {
    expect(fieldTypeLabel({kind: 'portableText'})).toBe('PortableText')
  })

  it('renders an object kind using its target class name', () => {
    expect(
      fieldTypeLabel({kind: 'object', target: 'HeroImage', relation: 'composition', array: false}),
    ).toBe('HeroImage')
  })
})

describe('renderField', () => {
  const baseField = (overrides: Partial<CanonicalField>): CanonicalField => ({
    name: 'title',
    char: {kind: 'primitive', prim: 'string', array: false},
    cardinality: {min: 1, max: 1},
    hasCustomMarker: false,
    ...overrides,
  })

  it('renders a required primitive scalar', () => {
    expect(renderField(baseField({}))).toBe('+title: string [1]')
  })

  it('renders an optional primitive scalar', () => {
    expect(renderField(baseField({cardinality: {min: 0, max: 1}}))).toBe('+title: string [0..1]')
  })

  it('renders a portable text field with scalar cardinality', () => {
    expect(
      renderField(
        baseField({
          name: 'overview',
          char: {kind: 'portableText'},
          cardinality: {min: 0, max: 1},
        }),
      ),
    ).toBe('+overview: PortableText [0..1]')
  })

  it('renders an object composition field with its target class name', () => {
    expect(
      renderField(
        baseField({
          name: 'heroImage',
          char: {kind: 'object', target: 'HeroImage', relation: 'composition', array: false},
          cardinality: {min: 0, max: 1},
        }),
      ),
    ).toBe('+heroImage: HeroImage [0..1]')
  })

  it('appends the custom marker when the field has one', () => {
    expect(renderField(baseField({hasCustomMarker: true}))).toBe('+title: string [1, custom]')
  })

  it('renders an array of objects with their target class name', () => {
    expect(
      renderField(
        baseField({
          name: 'tags',
          char: {kind: 'object', target: 'SkosConcept', relation: 'reference', array: true},
          cardinality: {min: 0, max: '*'},
        }),
      ),
    ).toBe('+tags: SkosConcept [0..*]')
  })
})

describe('renderClass', () => {
  it('renders a document class block with `:::document` styling and the stereotype annotation', () => {
    const lines = renderClass({
      name: 'Method',
      stereotype: 'document',
      origin: 'document',
      fields: [
        {
          name: 'title',
          char: {kind: 'primitive', prim: 'string', array: false},
          cardinality: {min: 1, max: 1},
          hasCustomMarker: false,
        },
      ],
    })
    expect(lines).toEqual([
      '  class Method:::document {',
      '    <<document>>',
      '    +title: string [1]',
      '  }',
    ])
  })

  it('renders an empty-field class block with the styleClass applied at declaration', () => {
    const lines = renderClass({
      name: 'Empty',
      stereotype: 'object',
      origin: 'object',
      fields: [],
    })
    expect(lines).toEqual(['  class Empty:::object {', '    <<object>>', '  }'])
  })
})

describe('renderEdge', () => {
  it('renders a composition edge with the filled-diamond arrow', () => {
    expect(
      renderEdge({
        source: 'Method',
        target: 'HeroImage',
        relation: 'composition',
        fieldName: 'heroImage',
      }),
    ).toBe('  Method *-- HeroImage : heroImage')
  })

  it('renders a reference edge with the simple association arrow', () => {
    expect(
      renderEdge({
        source: 'Method',
        target: 'Discipline',
        relation: 'reference',
        fieldName: 'discipline',
      }),
    ).toBe('  Method --> Discipline : discipline')
  })
})

describe('emit', () => {
  it('produces a string that starts with `classDiagram`', () => {
    const out = emit({classes: [], edges: [], warnings: []})
    expect(out.startsWith('classDiagram')).toBe(true)
  })

  it('includes a classDef line for each stereotype', () => {
    const out = emit({classes: [], edges: [], warnings: []})
    expect(out).toContain('classDef document fill:#1976d2,color:#fff')
    expect(out).toContain('classDef object fill:#757575,color:#fff')
  })

  it('emits classDef declarations at the end, after all class declarations and edges', () => {
    // Placement is empirical: mermaidviewer.com ignores classDef fills
    // when they appear before the classes they reference. The Mermaid
    // parser tolerates either order via forward-reference resolution,
    // but bottom-placement is the order that renders consistently across
    // mermaidviewer, mermaid.live, and GitHub markdown.
    const out = emit({
      classes: [
        {name: 'Method', stereotype: 'document', origin: 'document', fields: []},
        {name: 'HeroImage', stereotype: 'object', origin: 'image', fields: []},
      ],
      edges: [],
      warnings: [],
    })
    const classDefIdx = out.indexOf('classDef document')
    const firstClassIdx = out.indexOf('class Method:::document')
    expect(classDefIdx).toBeGreaterThan(-1)
    expect(firstClassIdx).toBeGreaterThan(-1)
    expect(classDefIdx).toBeGreaterThan(firstClassIdx)
    expect(out).toContain('class Method:::document {')
    expect(out).toContain('class HeroImage:::object {')
  })

  it('does NOT emit standalone `class Name stereotype` lines (those create phantom classes)', () => {
    // Regression guard: a previous version of emit produced lines like
    // `class Method document` intending to apply a classDef; Mermaid
    // actually parses that as "declare a new class called Methoddocument"
    // and renders an extra empty box.
    const out = emit({
      classes: [{name: 'Method', stereotype: 'document', origin: 'document', fields: []}],
      edges: [],
      warnings: [],
    })
    expect(out).not.toMatch(/^\s+class Method document\s*$/m)
    expect(out).not.toMatch(/Methoddocument/)
  })

  it('round-trips a real walker output into a coherent diagram string', () => {
    // End-to-end: a small fixture walked through to a real Mermaid string.
    // This is the only test in the emitter suite that touches walker —
    // proof the canonical-model contract is honoured at the seam.
    const model = walk([
      {
        name: 'method',
        type: 'document',
        fields: [
          {name: 'title', type: 'string', validation: (R: any) => R.required()},
          {name: 'heroImage', type: 'heroImage'},
          {
            name: 'tags',
            type: 'array',
            of: [{type: 'string'}],
            validation: (R: any) => R.required().min(2).max(5),
          },
        ],
      },
      {
        name: 'heroImage',
        type: 'image',
        fields: [{name: 'caption', type: 'string'}],
      },
    ])
    const out = emit(model)
    // Concrete substrings rather than a whole-string snapshot — small
    // assertions that resist incidental formatting changes.
    expect(out).toContain('class Method:::document {')
    expect(out).toContain('+title: string [1]')
    expect(out).toContain('+tags: string [2..5]')
    expect(out).toContain('+asset: url [1]') // synthesised on image-like
    expect(out).toContain('Method *-- HeroImage : heroImage')
  })
})
