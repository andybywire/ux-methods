// Generate docs/content-model.md from the Sanity Studio schema as a
// Mermaid `classDiagram`.
//
// Reads the schema via `sanity schema extract` (groq-type-nodes JSON) and
// emits a Markdown file with a single fenced Mermaid block. Document types
// get the <<document>> stereotype; named object types get <<object>>. Inline
// object fields are drawn as composition (*--); reference fields as
// association (-->). Cardinality (1, 0..1, 1..*, 0..*) comes from each
// attribute's `optional` flag combined with whether it is an array.
//
// See docs/decisions/0006-content-model-mermaid-export.md for the contract:
// mapping rules, skip patterns, output location, and the drift-tracking
// rationale (this file IS committed; its git history is the value).
//
// run: node scripts/content-model-mermaid-export.js
// against a non-default workspace:
//   SANITY_WORKSPACE=ai-settings node scripts/content-model-mermaid-export.js
// with a different output path:
//   OUT_FILE=../docs/content-model.md node scripts/content-model-mermaid-export.js
// keep the intermediate JSON for debugging:
//   KEEP_INTERMEDIATE=1 node scripts/content-model-mermaid-export.js

import {execFileSync} from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

const WORKSPACE = process.env.SANITY_WORKSPACE || 'production'
const OUT_FILE = process.env.OUT_FILE || '../docs/content-model.md'
const INTERMEDIATE_JSON = 'build/_sanity-schema.json' // gitignored via graph/.gitignore (build/)
const KEEP_INTERMEDIATE = process.env.KEEP_INTERMEDIATE === '1'

// Stereotype fills — kept in code so the ADR's styling decision lives next
// to the emission that depends on it.
const DOCUMENT_FILL = 'fill:#1976d2,color:#fff'
const OBJECT_FILL = 'fill:#757575,color:#fff'

// Type-name patterns that are NOT part of the user-authored content model.
// Matches are skipped — neither emitted as classes nor followed through
// when referenced from a field. (See ADR 0006.)
const SKIP_TYPE_PATTERNS = [
  /^sanity\./, // Sanity-internal helpers (imageAsset, hotspot, crop, …)
  /^assist\./, // @sanity/assist plugin documents/types
  /^geopoint$/, // not modelled
]

// Type names handled specially rather than emitted as their own class.
const PORTABLE_TEXT_TYPE_NAMES = new Set(['bodyPortableText'])
const SLUG_TYPE_NAMES = new Set(['slug'])

// Reference wrapper types ("X.reference"): the wrapper itself is skipped,
// but a field of that type becomes an association edge pointing to class X.
const isReferenceWrapperName = (name) => name.endsWith('.reference')

function shouldSkipTypeName(name) {
  return (
    SKIP_TYPE_PATTERNS.some((p) => p.test(name)) ||
    PORTABLE_TEXT_TYPE_NAMES.has(name) ||
    SLUG_TYPE_NAMES.has(name) ||
    isReferenceWrapperName(name)
  )
}

// Field names that are platform metadata, not part of the content model.
const SKIP_FIELD_NAMES = new Set([
  '_id',
  '_type',
  '_createdAt',
  '_updatedAt',
  '_rev',
  '_key',
  '_weak',
])

// Sanity-internal image structure — skipped only when the parent type is
// recognised as image-like (per ADR 0006: keep user-added fields like
// caption/alt; drop asset/hotspot/crop/media).
const IMAGE_INTERNAL_FIELD_NAMES = new Set(['asset', 'hotspot', 'crop', 'media'])

// ----------------------------------------------------------------------------
// Naming
// ----------------------------------------------------------------------------

const pascalCase = (s) => s.replace(/(^|[._-])([a-z])/g, (_, __, c) => c.toUpperCase())

// Mermaid primitive labels keyed by the internal datatype name used below.
const PRIMITIVE_LABEL = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
}

// ----------------------------------------------------------------------------
// Schema walking
// ----------------------------------------------------------------------------

// Recognise a `type: 'image'` object by its signature: asset + hotspot + crop.
function isImageLike(typeDef) {
  if (typeDef?.type !== 'type' || typeDef?.value?.type !== 'object') return false
  const attrs = typeDef.value.attributes ?? {}
  return 'asset' in attrs && 'hotspot' in attrs && 'crop' in attrs
}

// Turn a Sanity schema value-node into a field characterisation. Returns
// one of:
//   { kind: "primitive", prim: "string"|"number"|"boolean", array }
//   { kind: "object", target: "ClassName", relation: "composition"|"reference", array }
//   { kind: "portableText", array }
//   null  (not modelled — caller drops the field)
//
// `typeMap` is name → top-level type definition; used to resolve inline-name
// aliases (e.g. `referencedDiscipline` defined as an alias for
// `discipline.reference`) through to the ultimate target.
function characterize(value, typeMap) {
  if (!value || typeof value !== 'object') return null
  switch (value.type) {
    case 'string':
      return {kind: 'primitive', prim: 'string', array: false}
    case 'number':
      return {kind: 'primitive', prim: 'number', array: false}
    case 'boolean':
      return {kind: 'primitive', prim: 'boolean', array: false}
    case 'inline':
      return characterizeInlineName(value.name, typeMap)
    case 'array': {
      const inner = characterize(value.of, typeMap)
      if (!inner) return null
      return {...inner, array: true}
    }
    case 'union':
      // Portable Text lands here in the extracted schema (a union of block
      // and inline content types). Per ADR 0006: surface as the field-line
      // label `PortableText`, no edge, no class.
      return {kind: 'portableText', array: false}
    case 'object': {
      // Anonymous inline object — array items that wrap a reference via
      // `rest` show up here.
      const rest = value.rest
      if (rest?.type === 'inline') return characterizeInlineName(rest.name, typeMap)
      return null
    }
    default:
      return null
  }
}

function characterizeInlineName(name, typeMap, _seen = new Set()) {
  if (SLUG_TYPE_NAMES.has(name)) {
    return {kind: 'primitive', prim: 'string', array: false}
  }
  if (PORTABLE_TEXT_TYPE_NAMES.has(name)) {
    return {kind: 'portableText', array: false}
  }
  if (isReferenceWrapperName(name)) {
    const target = name.slice(0, -'.reference'.length)
    if (shouldSkipTypeName(target)) return null
    return {kind: 'object', target: pascalCase(target), relation: 'reference', array: false}
  }
  if (shouldSkipTypeName(name)) return null

  // Follow inline-name aliases: a top-level type whose value is itself an
  // `inline` reference to another type (e.g. `referencedDiscipline` →
  // `discipline.reference`). Without this, named alias wrappers would
  // emit edges pointing at classes that aren't themselves emitted.
  const def = typeMap?.get(name)
  if (def?.type === 'type' && def.value?.type === 'inline') {
    if (_seen.has(name)) return null // cycle guard
    _seen.add(name)
    return characterizeInlineName(def.value.name, typeMap, _seen)
  }

  return {kind: 'object', target: pascalCase(name), relation: 'composition', array: false}
}

// Per-field: { name, required, char }
function walkAttributes(typeDef, typeMap) {
  const out = []
  const imageLike = isImageLike(typeDef)
  const attrs =
    typeDef.type === 'document' ? (typeDef.attributes ?? {}) : (typeDef.value?.attributes ?? {})

  for (const [field, attr] of Object.entries(attrs)) {
    if (SKIP_FIELD_NAMES.has(field)) continue
    if (imageLike && IMAGE_INTERNAL_FIELD_NAMES.has(field)) continue
    if (attr?.type !== 'objectAttribute') continue
    const char = characterize(attr.value, typeMap)
    if (!char) continue
    // `optional` on an objectAttribute: true → optional; absent/false → required.
    // Caveat: `sanity schema extract` does NOT capture `Rule.required()`, so
    // user-authored fields always come through as `optional: true` regardless
    // of validation. Cardinality reported here is best-effort against the
    // structural schema, not against runtime validation rules.
    const required = !attr.optional
    out.push({name: field, required, char})
  }
  return out
}

// Cardinality string per ADR 0006's table.
function cardinality(required, array) {
  if (array) return required ? '1..*' : '0..*'
  return required ? '1' : '0..1'
}

// The label shown after `: ` on a field line.
function fieldTypeLabel(char) {
  if (char.kind === 'primitive') return PRIMITIVE_LABEL[char.prim]
  if (char.kind === 'portableText') return 'PortableText'
  return char.target // object
}

// Signature used to detect cross-class field-name collisions (see ADR 0006).
function fieldSignature(char) {
  if (char.kind === 'primitive') return `prim:${char.prim}`
  if (char.kind === 'portableText') return 'portableText'
  return `object:${char.target}` // relation deliberately excluded; reference-vs-composition isn't a "collision"
}

// ----------------------------------------------------------------------------
// Schema extraction (delegates to the Sanity CLI in studio/)
// ----------------------------------------------------------------------------

async function extractSchema() {
  const here = process.cwd()
  const studioDir = path.resolve(here, '../studio')
  const intermediateAbs = path.resolve(here, INTERMEDIATE_JSON)
  await fs.mkdir(path.dirname(intermediateAbs), {recursive: true})

  // The Sanity CLI treats --path as relative to its own cwd, so express the
  // output location relative to studio/.
  const intermediateForSanity = path.relative(studioDir, intermediateAbs)

  console.log(`Extracting schema (workspace: ${WORKSPACE})…`)
  execFileSync(
    'pnpm',
    [
      'exec',
      'sanity',
      'schema',
      'extract',
      '--workspace',
      WORKSPACE,
      '--path',
      intermediateForSanity,
    ],
    {cwd: studioDir, stdio: ['ignore', 'inherit', 'inherit']},
  )

  const json = await fs.readFile(intermediateAbs, 'utf8')
  return {schema: JSON.parse(json), intermediateAbs}
}

// ----------------------------------------------------------------------------
// Mermaid emission
// ----------------------------------------------------------------------------

const INDENT = '  '

function emitClassBlock({className, stereotype, fields}) {
  const lines = []
  lines.push(`${INDENT}class ${className} {`)
  lines.push(`${INDENT}${INDENT}<<${stereotype}>>`)
  for (const f of fields) {
    const card = cardinality(f.required, f.char.array)
    lines.push(`${INDENT}${INDENT}+${f.name}: ${fieldTypeLabel(f.char)} [${card}]`)
  }
  lines.push(`${INDENT}}`)
  return lines
}

function emitEdge({source, target, relation, fieldName}) {
  const arrow = relation === 'composition' ? '*--' : '-->'
  return `${INDENT}${source} ${arrow} ${target} : ${fieldName}`
}

function buildMermaid({classes, edges}) {
  const lines = ['classDiagram']

  for (const c of classes) {
    lines.push(...emitClassBlock(c))
  }

  for (const e of edges) {
    lines.push(emitEdge(e))
  }

  lines.push(`${INDENT}classDef document ${DOCUMENT_FILL}`)
  lines.push(`${INDENT}classDef object ${OBJECT_FILL}`)
  for (const c of classes) {
    lines.push(`${INDENT}class ${c.className} ${c.stereotype}`)
  }

  return lines.join('\n')
}

function buildMarkdown(mermaid) {
  return `# Content model

> Auto-generated from the Sanity Studio schema. Do not edit by hand — re-run \`pnpm --filter uxmethods-graph export:content-model\` to refresh. See [ADR 0006](decisions/0006-content-model-mermaid-export.md) for the contract.

\`\`\`mermaid
${mermaid}
\`\`\`
`
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
  const {schema, intermediateAbs} = await extractSchema()

  // typeMap is used by `characterize` to resolve inline-name aliases (e.g.
  // a top-level type whose value is `{ type: 'inline', name: 'X.reference' }`)
  // through to the ultimate target class.
  const typeMap = new Map()
  for (const t of schema) typeMap.set(t.name, t)

  // Kept types: documents + named object types that survive the skip patterns.
  // Inline-aliased top-level types (e.g. `referencedDiscipline`) are NOT kept
  // as their own classes — they're resolved through to the alias target by
  // `characterize`.
  const keptTypes = schema.filter((t) => {
    if (shouldSkipTypeName(t.name)) return false
    if (t.type === 'document') return true
    if (t.type === 'type' && t.value?.type === 'object') return true
    return false
  })

  // Per-class data, in the form `emitClassBlock` consumes.
  const classes = []
  const edges = []

  // Collision tracking: fieldName → Map<signature, Set<className>>.
  const fieldUsage = new Map()
  function recordUsage(fieldName, signature, className) {
    let sigMap = fieldUsage.get(fieldName)
    if (!sigMap) {
      sigMap = new Map()
      fieldUsage.set(fieldName, sigMap)
    }
    let classes = sigMap.get(signature)
    if (!classes) {
      classes = new Set()
      sigMap.set(signature, classes)
    }
    classes.add(className)
  }

  for (const t of keptTypes) {
    const className = pascalCase(t.name)
    const stereotype = t.type === 'document' ? 'document' : 'object'
    const fields = walkAttributes(t, typeMap)

    classes.push({className, stereotype, fields})

    for (const f of fields) {
      recordUsage(f.name, fieldSignature(f.char), className)
      if (f.char.kind === 'object') {
        edges.push({
          source: className,
          target: f.char.target,
          relation: f.char.relation,
          fieldName: f.name,
        })
      }
    }
  }

  // Drop edges whose target isn't actually being emitted as a class. This
  // can happen when a reference points at a type that itself got filtered
  // (e.g. an `assist.`-prefixed document type).
  const emittedClassNames = new Set(classes.map((c) => c.className))
  const keptEdges = edges.filter((e) => emittedClassNames.has(e.target))
  const droppedEdgeCount = edges.length - keptEdges.length

  // Deterministic ordering — git diffs are the whole point of this artefact.
  classes.sort((a, b) => {
    if (a.stereotype !== b.stereotype) {
      // documents before objects
      return a.stereotype === 'document' ? -1 : 1
    }
    return a.className.localeCompare(b.className)
  })
  keptEdges.sort((a, b) => {
    return (
      a.source.localeCompare(b.source) ||
      a.fieldName.localeCompare(b.fieldName) ||
      a.target.localeCompare(b.target)
    )
  })

  // Warn on cross-class field-name collisions (see ADR 0006). Same-signature
  // reuse across classes is fine; only differing signatures are surfaced.
  for (const [fieldName, sigMap] of fieldUsage) {
    if (sigMap.size < 2) continue
    const summary = [...sigMap.entries()]
      .map(([sig, classSet]) => `${sig} in {${[...classSet].sort().join(', ')}}`)
      .join('; ')
    console.warn(`[warn] field "${fieldName}" has differing types across classes: ${summary}`)
  }

  // --------------------------------------------------------------------------
  // Write file (and clean up the intermediate JSON unless asked to keep it)
  // --------------------------------------------------------------------------

  const mermaid = buildMermaid({classes, edges: keptEdges})
  const markdown = buildMarkdown(mermaid)

  const outAbs = path.resolve(process.cwd(), OUT_FILE)
  await fs.mkdir(path.dirname(outAbs), {recursive: true})
  await fs.writeFile(outAbs, markdown, 'utf8')

  if (!KEEP_INTERMEDIATE) {
    await fs.unlink(intermediateAbs).catch(() => {})
  }

  const docCount = classes.filter((c) => c.stereotype === 'document').length
  const objCount = classes.length - docCount
  console.log(
    `Wrote content-model to ${OUT_FILE} ` +
      `(${docCount} document classes, ${objCount} object classes, ${keptEdges.length} edges` +
      (droppedEdgeCount ? `, ${droppedEdgeCount} edges dropped: target type not emitted` : '') +
      `)`,
  )
}

await main()
