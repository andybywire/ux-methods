import {describe, it, expect, afterEach} from 'vitest'
import {generate} from './cli.ts'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtures = path.resolve(__dirname, '../tests/fixtures')

// Each test writes to a unique temp file and cleans it up afterward.
// We track them across the suite so a failing test doesn't leak garbage
// into the user's tmpdir.
const tempFiles: string[] = []
function tmpOutPath(): string {
  const p = path.join(os.tmpdir(), `cm-test-${Date.now()}-${Math.random().toString(36).slice(2)}.md`)
  tempFiles.push(p)
  return p
}

afterEach(async () => {
  await Promise.all(
    tempFiles.splice(0).map((p) => fs.unlink(p).catch(() => {})),
  )
})

describe('generate', () => {
  it('writes a markdown file with header, fenced mermaid block, and trailing newline', async () => {
    const outPath = tmpOutPath()
    await generate({
      studioPath: path.join(fixtures, 'mini-studio/schemaTypes'),
      outPath,
      log: () => {},
    })
    const content = await fs.readFile(outPath, 'utf8')
    expect(content).toContain('# Content model')
    expect(content).toContain('```mermaid\nclassDiagram')
    expect(content).toContain('class Method:::document {')
    expect(content).toContain('class Discipline:::document {')
    expect(content.endsWith('```\n')).toBe(true)
  })

  it('returns class and edge counts from the canonical model', async () => {
    const outPath = tmpOutPath()
    const result = await generate({
      studioPath: path.join(fixtures, 'mini-studio/schemaTypes'),
      outPath,
      log: () => {},
    })
    expect(result.classCount).toBe(2)
    expect(result.edgeCount).toBe(1) // Method --> Discipline
    expect(result.warnings).toEqual([])
  })

  it('forwards walker warnings to the log callback', async () => {
    // The with-warnings fixture has documentation.body (PortableText) vs
    // newsletter.body (string) — the cross-class field-type collision
    // case from ADR 0006. The walker emits a warning; the CLI should
    // pass it to log() prefixed with `[warn]`.
    const outPath = tmpOutPath()
    const captured: string[] = []
    const result = await generate({
      studioPath: path.join(fixtures, 'with-warnings/schemaTypes'),
      outPath,
      log: (m) => captured.push(m),
    })
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(captured.length).toBe(result.warnings.length)
    expect(captured.some((m) => m.startsWith('[warn] '))).toBe(true)
    expect(captured.some((m) => m.includes("'body'"))).toBe(true)
  })

  it('propagates loader errors when the studio path does not exist', async () => {
    await expect(
      generate({
        studioPath: '/nonexistent/path/to/schemaTypes',
        outPath: tmpOutPath(),
        log: () => {},
      }),
    ).rejects.toThrow(/not found/i)
  })

  it('creates parent directories for the output file if they do not exist', async () => {
    // Write into a nested directory that doesn't exist yet. The CLI
    // should mkdir -p so the user doesn't have to.
    const nestedOut = path.join(
      os.tmpdir(),
      `cm-nest-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      'subdir',
      'output.md',
    )
    tempFiles.push(nestedOut)
    await generate({
      studioPath: path.join(fixtures, 'mini-studio/schemaTypes'),
      outPath: nestedOut,
      log: () => {},
    })
    const exists = await fs
      .access(nestedOut)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(true)
    // Clean up the parent dirs we created.
    await fs.rm(path.dirname(path.dirname(nestedOut)), {recursive: true, force: true})
  })
})
