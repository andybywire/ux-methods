// Generate content-model.ttl from the Sanity Studio schema.
//
// Reads the schema via `sanity schema extract` and emits OWL/RDFS Turtle
// describing the content model under https://uxmethods.org/content-model/.
//
// See docs/decisions/0005-content-model-export.md for the rationale, scope
// boundaries, and mapping conventions. This artefact is generated and
// disposable — regenerate, don't edit by hand.
//
// run: node scripts/content-model-export.js
// run against a non-default workspace:
//   SANITY_WORKSPACE=ai-settings node scripts/content-model-export.js
// run with a different output path:
//   OUT_FILE=build/content-model.ttl node scripts/content-model-export.js
// keep the intermediate JSON for debugging:
//   KEEP_INTERMEDIATE=1 node scripts/content-model-export.js

import {execFileSync} from 'node:child_process'
import {DataFactory, Writer} from 'n3'
import fs from 'node:fs/promises'
import path from 'node:path'

const {namedNode, literal, quad} = DataFactory

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

const CONTENT_MODEL_NS = 'https://uxmethods.org/content-model/'
const ONTOLOGY_IRI = 'https://uxmethods.org/content-model'

const WORKSPACE = process.env.SANITY_WORKSPACE || 'production'
const OUT_FILE = process.env.OUT_FILE || 'build/content-model.ttl'
const INTERMEDIATE_JSON = 'build/_sanity-schema.json' // gitignored
const KEEP_INTERMEDIATE = process.env.KEEP_INTERMEDIATE === '1'

// Type-name patterns that are NOT part of the user-authored content model.
// Matches are skipped — neither emitted as classes nor followed through
// when referenced from a field.
const SKIP_TYPE_PATTERNS = [
  /^sanity\./, // Sanity-internal helpers (imageAsset, hotspot, crop, …)
  /^assist\./, // @sanity/assist plugin documents/types
  /^geopoint$/, // not modelled in v1
]

// Type names handled specially rather than emitted as their own class.
const PORTABLE_TEXT_TYPE_NAMES = new Set(['bodyPortableText'])
const SLUG_TYPE_NAMES = new Set(['slug'])

// Reference wrapper types ("X.reference"): the wrapper itself is skipped, but
// a field of that type becomes an object property pointing to class X.
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

// Field names that are Sanity-internal image structure — skipped only when
// the parent type is recognised as image-like (per ADR 0005: model user-added
// fields only, not Sanity's underlying asset/hotspot/crop).
const IMAGE_INTERNAL_FIELD_NAMES = new Set(['asset', 'hotspot', 'crop', 'media'])

// ----------------------------------------------------------------------------
// Vocab
// ----------------------------------------------------------------------------

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const OWL = 'http://www.w3.org/2002/07/owl#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'

const RDF_TYPE = namedNode(RDF + 'type')
const RDFS_LABEL = namedNode(RDFS + 'label')
const RDFS_COMMENT = namedNode(RDFS + 'comment')
const RDFS_DOMAIN = namedNode(RDFS + 'domain')
const RDFS_RANGE = namedNode(RDFS + 'range')
const OWL_ONTOLOGY = namedNode(OWL + 'Ontology')
const OWL_CLASS = namedNode(OWL + 'Class')
const OWL_OBJECT_PROPERTY = namedNode(OWL + 'ObjectProperty')
const OWL_DATATYPE_PROPERTY = namedNode(OWL + 'DatatypeProperty')
const OWL_FUNCTIONAL_PROPERTY = namedNode(OWL + 'FunctionalProperty')
const OWL_UNION_OF = namedNode(OWL + 'unionOf')

// ----------------------------------------------------------------------------
// Naming
// ----------------------------------------------------------------------------

const pascalCase = (s) => s.replace(/(^|[._-])([a-z])/g, (_, __, c) => c.toUpperCase())

// Humanise an identifier into a readable label.
// method -> "Method"; bodyImage -> "Body image"; ldMetadata -> "Ld metadata".
function humanLabel(s) {
  const spaced = s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._-]+/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const classIri = (name) => CONTENT_MODEL_NS + pascalCase(name)
const propertyIri = (name) => CONTENT_MODEL_NS + name

// ----------------------------------------------------------------------------
// Schema walking
// ----------------------------------------------------------------------------

// Recognise a `type: 'image'` object by its signature: asset + hotspot + crop.
function isImageLike(typeDef) {
  if (typeDef?.type !== 'type' || typeDef?.value?.type !== 'object') return false
  const attrs = typeDef.value.attributes ?? {}
  return 'asset' in attrs && 'hotspot' in attrs && 'crop' in attrs
}

// Turn a Sanity schema value-node into our property characterization.
// Returns one of:
//   { kind: "datatype", xsd: "string"|"decimal"|"boolean", array }
//   { kind: "object",   target: "ClassName",               array }
//   null                                                  (not modelled)
function characterize(value) {
  if (!value || typeof value !== 'object') return null
  switch (value.type) {
    case 'string':
      return {kind: 'datatype', xsd: 'string', array: false}
    case 'number':
      return {kind: 'datatype', xsd: 'decimal', array: false}
    case 'boolean':
      return {kind: 'datatype', xsd: 'boolean', array: false}
    case 'inline':
      return characterizeInlineName(value.name)
    case 'array': {
      const inner = characterize(value.of)
      if (!inner) return null
      return {...inner, array: true}
    }
    case 'union':
      // The portable-text shape lands here. Any field whose value is a union
      // is treated as Portable Text in v1 (see ADR 0005).
      return {kind: 'object', target: 'PortableText', array: false}
    case 'object': {
      // Anonymous inline object, often used by array items that wrap a
      // reference via `rest`.
      const rest = value.rest
      if (rest?.type === 'inline') return characterizeInlineName(rest.name)
      return null
    }
    case 'unknown':
    default:
      return null
  }
}

function characterizeInlineName(name) {
  if (SLUG_TYPE_NAMES.has(name)) {
    return {kind: 'datatype', xsd: 'string', array: false}
  }
  if (PORTABLE_TEXT_TYPE_NAMES.has(name)) {
    return {kind: 'object', target: 'PortableText', array: false}
  }
  if (isReferenceWrapperName(name)) {
    const target = name.slice(0, -'.reference'.length)
    if (shouldSkipTypeName(target)) return null
    return {kind: 'object', target: pascalCase(target), array: false}
  }
  if (shouldSkipTypeName(name)) return null
  return {kind: 'object', target: pascalCase(name), array: false}
}

// Walk a kept type's attributes; return [{ field, char }, ...] for the ones
// that survive the field-level skip rules.
function walkAttributes(typeDef) {
  const out = []
  const imageLike = isImageLike(typeDef)
  const attrs =
    typeDef.type === 'document' ? (typeDef.attributes ?? {}) : (typeDef.value?.attributes ?? {})

  for (const [field, attr] of Object.entries(attrs)) {
    if (SKIP_FIELD_NAMES.has(field)) continue
    if (imageLike && IMAGE_INTERNAL_FIELD_NAMES.has(field)) continue
    if (attr?.type !== 'objectAttribute') continue
    const char = characterize(attr.value)
    if (!char) continue
    out.push({field, char})
  }
  return out
}

// ----------------------------------------------------------------------------
// Schema extraction (delegates to the Sanity CLI)
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
// Main
// ----------------------------------------------------------------------------

async function main() {
  const {schema, intermediateAbs} = await extractSchema()

  // Index types by name (for resolution, even though we don't currently need
  // to look up types beyond the inline-name shortcuts).
  const typeMap = new Map()
  for (const t of schema) typeMap.set(t.name, t)

  // "Kept" types: documents + object types that survive the skip patterns.
  const keptTypes = schema.filter(
    (t) => (t.type === 'document' || t.type === 'type') && !shouldSkipTypeName(t.name),
  )

  // Accumulate per-property facts across every kept type's use of the field.
  // Per ADR 0005 decision #3: one global property per unique field name,
  // with rdfs:domain = unionOf of using classes.
  const properties = new Map()
  function observeProperty(name, sourceClass, char) {
    let p = properties.get(name)
    if (!p) {
      p = {
        domains: new Set(),
        dtypes: new Set(),
        objTargets: new Set(),
        allFunctional: true,
      }
      properties.set(name, p)
    }
    p.domains.add(sourceClass)
    if (char.kind === 'datatype') p.dtypes.add(char.xsd)
    else if (char.kind === 'object') p.objTargets.add(char.target)
    if (char.array) p.allFunctional = false
  }

  for (const t of keptTypes) {
    const cls = pascalCase(t.name)
    for (const {field, char} of walkAttributes(t)) {
      observeProperty(field, cls, char)
    }
  }

  // Drop properties whose only ranges turned out to be skipped types.
  for (const [name, p] of properties) {
    if (p.dtypes.size === 0 && p.objTargets.size === 0) properties.delete(name)
  }

  // --------------------------------------------------------------------------
  // Emit Turtle
  // --------------------------------------------------------------------------

  const writer = new Writer({
    prefixes: {
      rdf: RDF,
      rdfs: RDFS,
      owl: OWL,
      xsd: XSD,
      cm: CONTENT_MODEL_NS,
    },
  })

  // --- Ontology header ---
  const ont = namedNode(ONTOLOGY_IRI)
  writer.addQuad(quad(ont, RDF_TYPE, OWL_ONTOLOGY))
  writer.addQuad(quad(ont, RDFS_LABEL, literal('UX Methods – Sanity content model', 'en')))
  writer.addQuad(
    quad(
      ont,
      RDFS_COMMENT,
      literal(
        'OWL/RDFS representation of the UX Methods Sanity Studio schema, generated by ' +
          'graph/scripts/content-model-export.js. See docs/decisions/0005-content-model-export.md ' +
          'for scope and conventions. Generated artefact — regenerate, do not edit by hand.',
        'en',
      ),
    ),
  )

  // --- PortableText opaque class (per ADR 0005 decision #1) ---
  const portableText = namedNode(CONTENT_MODEL_NS + 'PortableText')
  writer.addQuad(quad(portableText, RDF_TYPE, OWL_CLASS))
  writer.addQuad(quad(portableText, RDFS_LABEL, literal('Portable Text', 'en')))
  writer.addQuad(
    quad(
      portableText,
      RDFS_COMMENT,
      literal(
        'Opaque stand-in for Sanity Portable Text fields. Internal block, mark, and ' +
          'annotation structure is intentionally not modelled.',
        'en',
      ),
    ),
  )

  // --- One class per kept type ---
  for (const t of keptTypes) {
    const cls = namedNode(classIri(t.name))
    writer.addQuad(quad(cls, RDF_TYPE, OWL_CLASS))
    writer.addQuad(quad(cls, RDFS_LABEL, literal(humanLabel(t.name), 'en')))
    if (t.type === 'document') {
      writer.addQuad(quad(cls, RDFS_COMMENT, literal('Sanity document type.', 'en')))
    } else if (isImageLike(t)) {
      writer.addQuad(
        quad(
          cls,
          RDFS_COMMENT,
          literal(
            'Sanity image-typed object. Only user-added fields are modelled; ' +
              'asset/hotspot/crop/media are omitted by design.',
            'en',
          ),
        ),
      )
    } else {
      writer.addQuad(quad(cls, RDFS_COMMENT, literal('Sanity object type.', 'en')))
    }
  }

  // --- One property per unique field name ---
  const propNames = [...properties.keys()].sort()
  for (const name of propNames) {
    const p = properties.get(name)
    const hasDtype = p.dtypes.size > 0
    const hasObj = p.objTargets.size > 0

    if (hasDtype && hasObj) {
      console.warn(
        `[warn] property "${name}" is used as both a datatype and an object property ` +
          `across types. Emitting as ObjectProperty; consider renaming one occurrence.`,
      )
    }
    const isObject = hasObj
    const prop = namedNode(propertyIri(name))

    writer.addQuad(
      quad(prop, RDF_TYPE, isObject ? OWL_OBJECT_PROPERTY : OWL_DATATYPE_PROPERTY),
    )
    if (p.allFunctional) {
      writer.addQuad(quad(prop, RDF_TYPE, OWL_FUNCTIONAL_PROPERTY))
    }
    writer.addQuad(quad(prop, RDFS_LABEL, literal(humanLabel(name), 'en')))

    // Domain (single class direct; multiple as owl:unionOf).
    const domainNodes = [...p.domains].sort().map((n) => namedNode(CONTENT_MODEL_NS + n))
    if (domainNodes.length === 1) {
      writer.addQuad(quad(prop, RDFS_DOMAIN, domainNodes[0]))
    } else if (domainNodes.length > 1) {
      const list = writer.list(domainNodes)
      const dom = writer.blank([
        {predicate: RDF_TYPE, object: OWL_CLASS},
        {predicate: OWL_UNION_OF, object: list},
      ])
      writer.addQuad(quad(prop, RDFS_DOMAIN, dom))
    }

    // Range.
    const rangeNodes = isObject
      ? [...p.objTargets].sort().map((target) => namedNode(CONTENT_MODEL_NS + target))
      : [...p.dtypes].sort().map((dt) => namedNode(XSD + dt))
    if (rangeNodes.length === 1) {
      writer.addQuad(quad(prop, RDFS_RANGE, rangeNodes[0]))
    } else if (rangeNodes.length > 1) {
      const list = writer.list(rangeNodes)
      const rng = writer.blank([
        {predicate: RDF_TYPE, object: OWL_CLASS},
        {predicate: OWL_UNION_OF, object: list},
      ])
      writer.addQuad(quad(prop, RDFS_RANGE, rng))
    }
  }

  // --------------------------------------------------------------------------
  // Write file (and clean up the intermediate JSON unless asked to keep it)
  // --------------------------------------------------------------------------

  const turtle = await new Promise((resolve, reject) => {
    writer.end((err, res) => (err ? reject(err) : resolve(res)))
  })

  const outAbs = path.resolve(process.cwd(), OUT_FILE)
  await fs.mkdir(path.dirname(outAbs), {recursive: true})
  await fs.writeFile(outAbs, turtle, 'utf8')

  if (!KEEP_INTERMEDIATE) {
    await fs.unlink(intermediateAbs).catch(() => {})
  }

  console.log(
    `Wrote content-model to ${OUT_FILE} ` +
      `(${keptTypes.length} classes, ${propNames.length} properties)`,
  )
}

await main()
