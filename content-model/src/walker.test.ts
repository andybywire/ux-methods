import {describe, it, expect} from 'vitest'
import {walk} from './walker.ts'

describe('walker', () => {
  it('produces a document-stereotype class for a `type: "document"` definition', () => {
    const types = [{name: 'discipline', type: 'document', fields: []}]
    const model = walk(types)
    expect(model.classes).toHaveLength(1)
    expect(model.classes[0]?.name).toBe('Discipline')
    expect(model.classes[0]?.stereotype).toBe('document')
  })

  it('produces an object-stereotype class for a `type: "object"` definition', () => {
    const types = [{name: 'heroImage', type: 'object', fields: []}]
    const model = walk(types)
    expect(model.classes).toHaveLength(1)
    expect(model.classes[0]?.name).toBe('HeroImage')
    expect(model.classes[0]?.stereotype).toBe('object')
  })

  it('skips types whose names match the skip patterns', () => {
    const types = [
      {name: 'sanity.imageAsset', type: 'document', fields: []},
      {name: 'assist.instruction', type: 'document', fields: []},
      {name: 'geopoint', type: 'object', fields: []},
      {name: 'discipline', type: 'document', fields: []},
    ]
    const model = walk(types)
    expect(model.classes).toHaveLength(1)
    expect(model.classes[0]?.name).toBe('Discipline')
  })

  it('walks primitive string fields with no validation as [0..1]', () => {
    const types = [
      {name: 'discipline', type: 'document', fields: [{name: 'title', type: 'string'}]},
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields).toHaveLength(1)
    expect(model.classes[0]?.fields[0]).toMatchObject({
      name: 'title',
      char: {kind: 'primitive', prim: 'string', array: false},
      cardinality: {min: 0, max: 1},
    })
  })

  it('reads Rule.required() through the probe and tightens cardinality to [1]', () => {
    const types = [
      {
        name: 'discipline',
        type: 'document',
        fields: [
          {name: 'title', type: 'string', validation: (R: any) => R.required()},
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.cardinality).toEqual({min: 1, max: 1})
  })

  it('skips platform metadata fields (_id, _type, _createdAt, _updatedAt, _rev)', () => {
    const types = [
      {
        name: 'discipline',
        type: 'document',
        fields: [
          {name: '_id', type: 'string'},
          {name: '_type', type: 'string'},
          {name: '_createdAt', type: 'datetime'},
          {name: '_updatedAt', type: 'datetime'},
          {name: '_rev', type: 'string'},
          {name: 'title', type: 'string'},
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields.map((f) => f.name)).toEqual(['title'])
  })

  it('marks array fields as array: true in the characterization', () => {
    const types = [
      {
        name: 'discipline',
        type: 'document',
        fields: [{name: 'tags', type: 'array', of: [{type: 'string'}]}],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.char).toMatchObject({
      kind: 'primitive',
      prim: 'string',
      array: true,
    })
  })

  it('produces [0..*] cardinality for an array of primitives with no validation', () => {
    const types = [
      {
        name: 'discipline',
        type: 'document',
        fields: [{name: 'tags', type: 'array', of: [{type: 'string'}]}],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.cardinality).toEqual({min: 0, max: '*'})
  })

  it('produces [1..*] cardinality for a required array', () => {
    const types = [
      {
        name: 'discipline',
        type: 'document',
        fields: [
          {
            name: 'tags',
            type: 'array',
            of: [{type: 'string'}],
            validation: (R: any) => R.required(),
          },
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.cardinality).toEqual({min: 1, max: '*'})
  })

  it('tightens array cardinality using Rule.min/Rule.max from the probe', () => {
    const types = [
      {
        name: 'discipline',
        type: 'document',
        fields: [
          {
            name: 'tags',
            type: 'array',
            of: [{type: 'string'}],
            validation: (R: any) => R.required().min(2).max(5),
          },
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.cardinality).toEqual({min: 2, max: 5})
  })

  it('characterises a reference field as kind: object, relation: reference', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [{name: 'discipline', type: 'reference', to: [{type: 'discipline'}]}],
      },
      {name: 'discipline', type: 'document', fields: []},
    ]
    const model = walk(types)
    const methodClass = model.classes.find((c) => c.name === 'Method')
    expect(methodClass?.fields[0]?.char).toEqual({
      kind: 'object',
      target: 'Discipline',
      relation: 'reference',
      array: false,
    })
  })

  it('emits an association edge for a reference field', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [{name: 'discipline', type: 'reference', to: [{type: 'discipline'}]}],
      },
      {name: 'discipline', type: 'document', fields: []},
    ]
    const model = walk(types)
    expect(model.edges).toContainEqual({
      source: 'Method',
      target: 'Discipline',
      relation: 'reference',
      fieldName: 'discipline',
    })
  })

  it('handles an array of references as kind: object, array: true', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {
            name: 'disciplines',
            type: 'array',
            of: [{type: 'reference', to: [{type: 'discipline'}]}],
          },
        ],
      },
      {name: 'discipline', type: 'document', fields: []},
    ]
    const model = walk(types)
    const methodClass = model.classes.find((c) => c.name === 'Method')
    expect(methodClass?.fields[0]?.char).toEqual({
      kind: 'object',
      target: 'Discipline',
      relation: 'reference',
      array: true,
    })
    expect(model.edges).toContainEqual({
      source: 'Method',
      target: 'Discipline',
      relation: 'reference',
      fieldName: 'disciplines',
    })
  })

  it('resolves named object types referenced as fields to composition edges', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [{name: 'heroImage', type: 'heroImage'}],
      },
      {name: 'heroImage', type: 'object', fields: []},
    ]
    const model = walk(types)
    const methodClass = model.classes.find((c) => c.name === 'Method')
    expect(methodClass?.fields[0]?.char).toEqual({
      kind: 'object',
      target: 'HeroImage',
      relation: 'composition',
      array: false,
    })
    expect(model.edges).toContainEqual({
      source: 'Method',
      target: 'HeroImage',
      relation: 'composition',
      fieldName: 'heroImage',
    })
  })

  it('resolves named object types inside arrays', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [{name: 'sources', type: 'array', of: [{type: 'source'}]}],
      },
      {name: 'source', type: 'object', fields: []},
    ]
    const model = walk(types)
    const methodClass = model.classes.find((c) => c.name === 'Method')
    expect(methodClass?.fields[0]?.char).toMatchObject({
      kind: 'object',
      target: 'Source',
      relation: 'composition',
      array: true,
    })
  })

  it('drops fields whose type is unknown (not primitive, not reference, not in typeMap)', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {name: 'mystery', type: 'somethingUnknown'},
          {name: 'title', type: 'string'},
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields.map((f) => f.name)).toEqual(['title'])
  })

  it('resolves an inline-alias reference type through to its target', () => {
    // referencedDiscipline is a named alias whose underlying type is a
    // reference to discipline. A field of type referencedDiscipline should
    // resolve to a reference edge pointing at Discipline directly.
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [{name: 'discipline', type: 'referencedDiscipline'}],
      },
      {name: 'referencedDiscipline', type: 'reference', to: [{type: 'discipline'}]},
      {name: 'discipline', type: 'document', fields: []},
    ]
    const model = walk(types)
    const methodClass = model.classes.find((c) => c.name === 'Method')
    expect(methodClass?.fields[0]?.char).toEqual({
      kind: 'object',
      target: 'Discipline',
      relation: 'reference',
      array: false,
    })
    expect(model.edges).toContainEqual({
      source: 'Method',
      target: 'Discipline',
      relation: 'reference',
      fieldName: 'discipline',
    })
  })

  it('does not emit the alias itself as a class', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [{name: 'discipline', type: 'referencedDiscipline'}],
      },
      {name: 'referencedDiscipline', type: 'reference', to: [{type: 'discipline'}]},
      {name: 'discipline', type: 'document', fields: []},
    ]
    const model = walk(types)
    expect(model.classes.map((c) => c.name).sort()).toEqual(['Discipline', 'Method'])
  })

  it('resolves an alias used inside an array of references', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {name: 'disciplines', type: 'array', of: [{type: 'referencedDiscipline'}]},
        ],
      },
      {name: 'referencedDiscipline', type: 'reference', to: [{type: 'discipline'}]},
      {name: 'discipline', type: 'document', fields: []},
    ]
    const model = walk(types)
    const methodClass = model.classes.find((c) => c.name === 'Method')
    expect(methodClass?.fields[0]?.char).toEqual({
      kind: 'object',
      target: 'Discipline',
      relation: 'reference',
      array: true,
    })
  })

  it('sets hasCustomMarker: false for a field with only required validation', () => {
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [{name: 'title', type: 'string', validation: (R: any) => R.required()}],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.hasCustomMarker).toBe(false)
  })

  it('sets hasCustomMarker: true when the field has a custom validator', () => {
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [
          {name: 'title', type: 'string', validation: (R: any) => R.custom(() => true)},
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.hasCustomMarker).toBe(true)
  })

  it('sets hasCustomMarker: true when the field has other constraints (regex, email, …)', () => {
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [{name: 'slug', type: 'string', validation: (R: any) => R.regex(/^x/)}],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.hasCustomMarker).toBe(true)
  })

  it('treats Rule.min/max on a non-array as constraints (hasCustomMarker: true)', () => {
    // On a string field, min/max bound the length — that's a value constraint
    // the diagram can't render in detail. Bucket into the custom marker.
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [{name: 'title', type: 'string', validation: (R: any) => R.min(2).max(10)}],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.hasCustomMarker).toBe(true)
  })

  it('does NOT set hasCustomMarker for Rule.min/max on an array (those are cardinality)', () => {
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [
          {
            name: 'tags',
            type: 'array',
            of: [{type: 'string'}],
            validation: (R: any) => R.min(2).max(5),
          },
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.hasCustomMarker).toBe(false)
  })

  it('characterises a portable text field (array of blocks) as kind: portableText', () => {
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [{name: 'overview', type: 'array', of: [{type: 'block'}]}],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.char).toEqual({kind: 'portableText'})
  })

  it('does not emit an edge or a PortableText class for portable text fields', () => {
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [{name: 'overview', type: 'array', of: [{type: 'block'}]}],
      },
    ]
    const model = walk(types)
    expect(model.edges).toEqual([])
    expect(model.classes.map((c) => c.name)).not.toContain('PortableText')
  })

  it('treats portable text cardinality as scalar — [0..1] by default', () => {
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [{name: 'overview', type: 'array', of: [{type: 'block'}]}],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.cardinality).toEqual({min: 0, max: 1})
  })

  it('treats required portable text as [1]', () => {
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [
          {
            name: 'overview',
            type: 'array',
            of: [{type: 'block'}],
            validation: (R: any) => R.required(),
          },
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.cardinality).toEqual({min: 1, max: 1})
  })

  it('characterises a slug field as a primitive string', () => {
    const types = [
      {
        name: 'doc',
        type: 'document',
        fields: [{name: 'slug', type: 'slug'}],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields[0]?.char).toEqual({
      kind: 'primitive',
      prim: 'string',
      array: false,
    })
  })

  it('emits a `type: "image"` top-level type as an object-stereotype class', () => {
    const types = [
      {name: 'heroImage', type: 'image', fields: [{name: 'caption', type: 'string'}]},
    ]
    const model = walk(types)
    const cls = model.classes.find((c) => c.name === 'HeroImage')
    expect(cls?.stereotype).toBe('object')
  })

  it('synthesises an `asset: url` field on image-like classes', () => {
    const types = [
      {name: 'heroImage', type: 'image', fields: [{name: 'caption', type: 'string'}]},
    ]
    const model = walk(types)
    const cls = model.classes.find((c) => c.name === 'HeroImage')
    const asset = cls?.fields.find((f) => f.name === 'asset')
    expect(asset?.char).toEqual({kind: 'primitive', prim: 'url', array: false})
    expect(asset?.cardinality).toEqual({min: 1, max: 1})
  })

  it('keeps user-added fields on image-like classes alongside the synthesised asset', () => {
    const types = [
      {
        name: 'heroImage',
        type: 'image',
        fields: [
          {name: 'caption', type: 'string'},
          {name: 'alt', type: 'string'},
        ],
      },
    ]
    const model = walk(types)
    const cls = model.classes.find((c) => c.name === 'HeroImage')
    expect(cls?.fields.map((f) => f.name)).toEqual(['asset', 'caption', 'alt'])
  })

  it('skips hotspot/crop/media fields if a schema actually declares them on an image type', () => {
    const types = [
      {
        name: 'heroImage',
        type: 'image',
        fields: [
          {name: 'caption', type: 'string'},
          {name: 'hotspot', type: 'object', fields: []},
          {name: 'crop', type: 'object', fields: []},
          {name: 'media', type: 'reference', to: [{type: 'sanity.imageAsset'}]},
        ],
      },
    ]
    const model = walk(types)
    const cls = model.classes.find((c) => c.name === 'HeroImage')
    expect(cls?.fields.map((f) => f.name)).toEqual(['asset', 'caption'])
  })

  it('emits an inline anonymous object as its own class with a composition edge', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {
            name: 'metadata',
            type: 'object',
            fields: [
              {name: 'createdAt', type: 'string'},
              {name: 'updatedAt', type: 'string'},
            ],
          },
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes.map((c) => c.name).sort()).toEqual(['Metadata', 'Method'])
    const metadataClass = model.classes.find((c) => c.name === 'Metadata')
    expect(metadataClass?.stereotype).toBe('object')
    expect(metadataClass?.fields.map((f) => f.name)).toEqual(['createdAt', 'updatedAt'])
    expect(model.edges).toContainEqual({
      source: 'Method',
      target: 'Metadata',
      relation: 'composition',
      fieldName: 'metadata',
    })
  })

  it('emits an inline anonymous object inside an array as its own class', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {
            name: 'sources',
            type: 'array',
            of: [
              {
                type: 'object',
                fields: [
                  {name: 'name', type: 'string'},
                  {name: 'url', type: 'url'},
                ],
              },
            ],
          },
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes.map((c) => c.name).sort()).toEqual(['Method', 'Sources'])
    const sourcesClass = model.classes.find((c) => c.name === 'Sources')
    expect(sourcesClass?.fields.map((f) => f.name)).toEqual(['name', 'url'])
  })

  it('disambiguates two inline objects sharing a field name by parent-prefixing both', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {
            name: 'metadata',
            type: 'object',
            fields: [{name: 'createdAt', type: 'string'}],
          },
        ],
      },
      {
        name: 'discipline',
        type: 'document',
        fields: [
          {
            name: 'metadata',
            type: 'object',
            fields: [{name: 'reviewedAt', type: 'string'}],
          },
        ],
      },
    ]
    const model = walk(types)
    const classNames = model.classes.map((c) => c.name).sort()
    expect(classNames).toEqual(['Discipline', 'DisciplineMetadata', 'Method', 'MethodMetadata'])
    // Each parent links to its own prefixed inline class.
    expect(model.edges).toContainEqual({
      source: 'Method',
      target: 'MethodMetadata',
      relation: 'composition',
      fieldName: 'metadata',
    })
    expect(model.edges).toContainEqual({
      source: 'Discipline',
      target: 'DisciplineMetadata',
      relation: 'composition',
      fieldName: 'metadata',
    })
  })

  it('warns when inline-object names collide', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {name: 'metadata', type: 'object', fields: [{name: 'createdAt', type: 'string'}]},
        ],
      },
      {
        name: 'discipline',
        type: 'document',
        fields: [
          {name: 'metadata', type: 'object', fields: [{name: 'reviewedAt', type: 'string'}]},
        ],
      },
    ]
    const model = walk(types)
    expect(model.warnings.some((w) => w.includes("'metadata'"))).toBe(true)
  })

  it('parent-prefixes an inline object when its bare name collides with a named class', () => {
    const types = [
      {name: 'metadata', type: 'object', fields: [{name: 'global', type: 'string'}]},
      {
        name: 'method',
        type: 'document',
        fields: [
          {
            name: 'metadata',
            type: 'object',
            fields: [{name: 'local', type: 'string'}],
          },
        ],
      },
    ]
    const model = walk(types)
    // The named Metadata keeps its bare name; the inline gets parent-prefixed.
    expect(model.classes.find((c) => c.name === 'Metadata')?.fields.map((f) => f.name)).toEqual([
      'global',
    ])
    expect(
      model.classes.find((c) => c.name === 'MethodMetadata')?.fields.map((f) => f.name),
    ).toEqual(['local'])
  })

  it('drops edges whose target is a skipped type', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {name: 'preview', type: 'reference', to: [{type: 'sanity.imageAsset'}]},
        ],
      },
    ]
    const model = walk(types)
    expect(model.edges).toEqual([])
  })

  it('warns when an edge target is filtered', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {name: 'preview', type: 'reference', to: [{type: 'sanity.imageAsset'}]},
        ],
      },
    ]
    const model = walk(types)
    expect(model.warnings.some((w) => w.includes("'preview'"))).toBe(true)
  })

  it('warns when the same field name has different types across classes', () => {
    // documentation.body is PortableText; newsletter.body is a plain string.
    // Mermaid emits both classes with their own field, so there's no structural
    // collision — but the name reuse is a modeling smell worth surfacing.
    const types = [
      {
        name: 'documentation',
        type: 'document',
        fields: [{name: 'body', type: 'array', of: [{type: 'block'}]}],
      },
      {
        name: 'newsletter',
        type: 'document',
        fields: [{name: 'body', type: 'string'}],
      },
    ]
    const model = walk(types)
    expect(model.warnings.some((w) => w.includes("'body'"))).toBe(true)
  })

  it('does NOT warn when the same field name has the same type across classes', () => {
    // `title` as a plain string on every document is the normal, expected
    // case. No warning should be emitted.
    const types = [
      {name: 'method', type: 'document', fields: [{name: 'title', type: 'string'}]},
      {name: 'discipline', type: 'document', fields: [{name: 'title', type: 'string'}]},
    ]
    const model = walk(types)
    expect(model.warnings.some((w) => w.includes("'title'"))).toBe(false)
  })

  it('sorts classes with documents alphabetical first, then objects alphabetical', () => {
    // Declaration order is deliberately scrambled to prove sorting is real.
    const types = [
      {name: 'heroImage', type: 'object', fields: []},
      {name: 'method', type: 'document', fields: []},
      {name: 'source', type: 'object', fields: []},
      {name: 'discipline', type: 'document', fields: []},
    ]
    const model = walk(types)
    expect(model.classes.map((c) => c.name)).toEqual([
      'Discipline',
      'Method',
      'HeroImage',
      'Source',
    ])
  })

  it('sorts edges by (source, fieldName, target)', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {name: 'output', type: 'reference', to: [{type: 'discipline'}]},
          {name: 'input', type: 'reference', to: [{type: 'discipline'}]},
        ],
      },
      {
        name: 'discipline',
        type: 'document',
        fields: [{name: 'parent', type: 'reference', to: [{type: 'method'}]}],
      },
    ]
    const model = walk(types)
    // Discipline.parent comes before Method.input (sorted by source first).
    // Method.input comes before Method.output (sorted by fieldName within same source).
    expect(model.edges.map((e) => `${e.source}.${e.fieldName}->${e.target}`)).toEqual([
      'Discipline.parent->Method',
      'Method.input->Discipline',
      'Method.output->Discipline',
    ])
  })

  it('preserves field declaration order within a class (does not sort fields)', () => {
    const types = [
      {
        name: 'method',
        type: 'document',
        fields: [
          {name: 'zeta', type: 'string'},
          {name: 'alpha', type: 'string'},
          {name: 'middle', type: 'string'},
        ],
      },
    ]
    const model = walk(types)
    expect(model.classes[0]?.fields.map((f) => f.name)).toEqual(['zeta', 'alpha', 'middle'])
  })
})
