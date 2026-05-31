// Loader: studio TS schemaTypes → array of raw type objects.
//
// Dynamically imports a Sanity Studio's `schemaTypes` entry module and
// returns the array the walker consumes. Accepts either a file path or
// a directory path; resolves both common export shapes (default export
// and `export const schemaTypes = [...]`); throws clear errors on common
// failure modes.
//
// Caller must be running under a TypeScript-aware runtime — `tsx` for the
// CLI, `vitest` for tests. Plain `node` won't resolve the `.ts` imports
// the studio's index file makes across sibling modules.

import fs from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

/**
 * Load the schemaTypes array from a Sanity Studio TS module. Returns the
 * raw array — the walker is what understands it.
 *
 * @param entryPath Absolute or relative path to either the entry TS file
 *   (e.g. `studio/schemaTypes/index.ts`) or the directory containing it
 *   (e.g. `studio/schemaTypes`, in which case the loader looks for
 *   `index.ts` inside).
 */
export async function loadSchemaTypes(entryPath: string): Promise<unknown[]> {
  const filePath = await resolveEntryFile(entryPath)
  const fileUrl = pathToFileURL(filePath).href

  let mod: Record<string, unknown>
  try {
    mod = (await import(fileUrl)) as Record<string, unknown>
  } catch (err) {
    // Re-throw with the file path attached so callers can see what we
    // were trying to load. The underlying error (syntax, missing dep, …)
    // is preserved as the cause.
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to import schemaTypes from ${filePath}: ${message}`, {
      cause: err,
    })
  }

  // Try each recognised export shape in priority order. Sanity studios in
  // the wild use either of these patterns; we accept both rather than
  // demand the user pick one.
  const candidateKeys = ['default', 'schemaTypes', 'types']
  for (const key of candidateKeys) {
    const value = mod[key]
    if (Array.isArray(value)) return value
  }

  throw new Error(
    `Module at ${filePath} has no recognised schemaTypes export. ` +
      `Expected one of: ${candidateKeys.join(', ')} (as an array). ` +
      `Found exports: ${Object.keys(mod).join(', ') || '(none)'}`,
  )
}

/**
 * Resolve the input path to an absolute file path. If the path is a
 * directory, look for `index.ts` inside; otherwise treat it as the file
 * directly. Throws when the path doesn't exist at all.
 */
async function resolveEntryFile(entryPath: string): Promise<string> {
  const absolute = path.resolve(entryPath)
  let stat
  try {
    stat = await fs.stat(absolute)
  } catch {
    throw new Error(`Path not found: ${absolute}`)
  }

  if (stat.isDirectory()) {
    const indexPath = path.join(absolute, 'index.ts')
    try {
      await fs.access(indexPath)
      return indexPath
    } catch {
      throw new Error(`No index.ts found in directory: ${absolute}`)
    }
  }

  return absolute
}
