// CLI: orchestrate loader → walker → emit → file write.
//
// Designed for two consumption modes:
//
//   1. Direct CLI use via `pnpm --filter uxmethods-content-model generate`
//      (which runs this file under tsx). Args are parsed from process.argv;
//      defaults are relative to the content-model/ directory so the
//      zero-config invocation Just Works for this repo's layout.
//
//   2. Programmatic use via `import {generate}`. The orchestration is
//      exported as a pure-ish function (no argv parsing, no process.exit,
//      a callback for warning output) so it's straightforward to test
//      and to call from a future plugin or app context.

import fs from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

import {loadSchemaTypes} from './load-ts.ts'
import {walk} from './walker.ts'
import {emit} from './emit-mermaid.ts'

export interface GenerateOptions {
  /** Path to schemaTypes (file or directory). Resolved relative to CWD. */
  studioPath: string
  /** Path to write the generated .md. Resolved relative to CWD. */
  outPath: string
  /**
   * Warning sink. Defaults to console.error so warnings go to stderr.
   * Tests inject a capturing callback to assert on the warning list
   * without console mocking.
   */
  log?: (msg: string) => void
}

export interface GenerateResult {
  warnings: string[]
  classCount: number
  edgeCount: number
}

const MARKDOWN_PREAMBLE = `# Content model

> Auto-generated from the Sanity Studio schema. Do not edit by hand — re-run \`pnpm --filter uxmethods-content-model generate\` to refresh. See [ADR 0006](decisions/0006-content-model-mermaid-export.md) for the contract.

`

/**
 * Load, walk, emit, and write a content-model markdown file. Returns
 * counts and the warnings list. Warnings are also forwarded to `log`
 * one at a time as they're emitted by the walker, so a long-running
 * watcher could surface them progressively.
 */
export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const {studioPath, outPath, log = (msg) => console.error(msg)} = options

  const types = await loadSchemaTypes(studioPath)
  const model = walk(types)
  const mermaid = emit(model)
  const markdown = `${MARKDOWN_PREAMBLE}\`\`\`mermaid\n${mermaid}\n\`\`\`\n`

  const resolvedOut = path.resolve(outPath)
  await fs.mkdir(path.dirname(resolvedOut), {recursive: true})
  await fs.writeFile(resolvedOut, markdown, 'utf8')

  for (const w of model.warnings) log(`[warn] ${w}`)

  return {
    warnings: model.warnings,
    classCount: model.classes.length,
    edgeCount: model.edges.length,
  }
}

interface CliArgs {
  studio: string
  out: string
}

function parseArgs(argv: string[]): CliArgs {
  // Defaults make `pnpm --filter uxmethods-content-model generate` work
  // zero-config from this repo's layout — content-model/ is one level
  // below the studio/ and docs/ siblings.
  const args: CliArgs = {
    studio: '../studio/schemaTypes',
    out: '../docs/content-model.md',
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--studio' && i + 1 < argv.length) {
      args.studio = argv[++i] as string
    } else if (arg === '--out' && i + 1 < argv.length) {
      args.out = argv[++i] as string
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      process.stderr.write(`Unknown argument: ${arg}\n`)
      printHelp()
      process.exit(1)
    }
  }
  return args
}

function printHelp(): void {
  process.stdout.write(
    [
      'Usage: tsx src/cli.ts [--studio <path>] [--out <path>]',
      '',
      '  --studio  Path to schemaTypes (file or directory containing index.ts).',
      '            Default: ../studio/schemaTypes',
      '  --out     Path to write the generated .md.',
      '            Default: ../docs/content-model.md',
      '  --help    Show this message.',
      '',
    ].join('\n'),
  )
}

async function main(): Promise<void> {
  const {studio, out} = parseArgs(process.argv.slice(2))
  try {
    const result = await generate({studioPath: studio, outPath: out})
    const warnPart = result.warnings.length > 0 ? `, ${result.warnings.length} warnings` : ''
    process.stdout.write(
      `Wrote ${out} (${result.classCount} classes, ${result.edgeCount} edges${warnPart})\n`,
    )
  } catch (err) {
    process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
    process.exit(1)
  }
}

// Entry-point check: run main() only when this file is invoked directly,
// not when imported by tests or other modules. The `file://` URL form is
// the cross-platform-safe comparison.
const argvFirst = process.argv[1]
const isMain = argvFirst !== undefined && import.meta.url === pathToFileURL(argvFirst).href
if (isMain) {
  await main()
}
