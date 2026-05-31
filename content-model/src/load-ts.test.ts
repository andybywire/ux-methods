import {describe, it, expect} from 'vitest'
import {loadSchemaTypes} from './load-ts.ts'
import {walk} from './walker.ts'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtures = path.resolve(__dirname, '../tests/fixtures')

describe('loadSchemaTypes', () => {
  it('loads from a directory by finding index.ts inside it', async () => {
    const types = await loadSchemaTypes(path.join(fixtures, 'mini-studio/schemaTypes'))
    expect(Array.isArray(types)).toBe(true)
    expect(types).toHaveLength(2)
  })

  it('loads from a file path directly', async () => {
    const types = await loadSchemaTypes(
      path.join(fixtures, 'mini-studio/schemaTypes/index.ts'),
    )
    expect(types).toHaveLength(2)
  })

  it('recognises a named `schemaTypes` export', async () => {
    const types = await loadSchemaTypes(path.join(fixtures, 'mini-studio/schemaTypes'))
    // Confirm the fixture's named export reached us with its shape intact.
    expect(types[0]).toMatchObject({name: 'discipline', type: 'document'})
    expect(types[1]).toMatchObject({name: 'method', type: 'document'})
  })

  it('recognises a default export', async () => {
    const types = await loadSchemaTypes(path.join(fixtures, 'default-export-studio'))
    expect(types).toHaveLength(1)
    expect(types[0]).toMatchObject({name: 'sample', type: 'document'})
  })

  it('throws when the path does not exist', async () => {
    await expect(
      loadSchemaTypes('/nonexistent/path/to/schemaTypes'),
    ).rejects.toThrow(/not found/i)
  })

  it('throws when the module has no recognised schemaTypes export', async () => {
    await expect(loadSchemaTypes(path.join(fixtures, 'bad-export'))).rejects.toThrow(
      /no recognised schemaTypes export/i,
    )
  })

  it('round-trips through the walker to produce a canonical model', async () => {
    // End-to-end: load → walk. Proof the loader's output is in fact the
    // shape the walker expects, with no adaptation layer required.
    const types = await loadSchemaTypes(path.join(fixtures, 'mini-studio/schemaTypes'))
    const model = walk(types)
    expect(model.classes.map((c) => c.name).sort()).toEqual(['Discipline', 'Method'])
    // Confirm the cardinality precision actually flows through — Method.title
    // was declared with `Rule.required()` in the fixture, so it should be [1].
    const method = model.classes.find((c) => c.name === 'Method')
    const title = method?.fields.find((f) => f.name === 'title')
    expect(title?.cardinality).toEqual({min: 1, max: 1})
  })
})
