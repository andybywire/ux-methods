// Walker: live Sanity schemaTypes → canonical model
//
// Consumes the array of type definitions you'd get by importing
// `studio/schemaTypes/index.ts` directly — live `defineType`-shaped objects,
// not the JSON produced by `sanity schema extract`. The walker resolves
// references, follows inline-alias wrappers, applies skip rules, and
// (eventually) probes each field's validation function to determine
// cardinality with the precision schema-extract can't deliver.
//
// See ../../docs/decisions/0006-content-model-mermaid-export.md for the
// contract this walker satisfies.

import {probe} from './probe.ts'

export type Stereotype = 'document' | 'object'
export type PrimitiveKind = 'string' | 'number' | 'boolean' | 'url'
export type Relation = 'composition' | 'reference'

/**
 * Editorial origin of a canonical class — preserved separately from
 * `stereotype` (the rendering decision) so downstream consumers can
 * filter on what a class actually came from. The plugin UI's expected
 * use is "let the user hide all inline objects" or "hide all images";
 * those questions can't be answered from `stereotype` alone since
 * `object`, `image`, and `inline` all render with the `<<object>>` tag.
 */
export type ClassOrigin = 'document' | 'object' | 'image' | 'inline'

export interface PrimitiveChar {
  kind: 'primitive'
  prim: PrimitiveKind
  array: boolean
}

export interface ObjectChar {
  kind: 'object'
  /** Class name of the related type, pascal-cased. */
  target: string
  /** Composition for inline objects, reference for `type: 'reference'` fields. */
  relation: Relation
  array: boolean
}

/**
 * Portable Text. Structurally an array of blocks in Sanity, but
 * semantically a single body of content — surfaced as a scalar field with
 * the type label `PortableText`, no edge, no class.
 */
export interface PortableTextChar {
  kind: 'portableText'
}

export type FieldChar = PrimitiveChar | ObjectChar | PortableTextChar

/** Whether a field's characterisation represents an array of values. */
export function isArrayChar(char: FieldChar): boolean {
  if (char.kind === 'portableText') return false
  return char.array
}

export interface Edge {
  source: string
  target: string
  relation: Relation
  fieldName: string
}

export interface Cardinality {
  /** Lower bound — 0 or 1 for now; arrays may push this higher via Rule.min. */
  min: number
  /** Upper bound — 1 for scalars, '*' for unbounded arrays, or a number for bounded arrays. */
  max: number | '*'
}

export interface CanonicalField {
  name: string
  char: FieldChar
  cardinality: Cardinality
  /**
   * True when the field has validation the diagram cannot fully render —
   * `Rule.custom(…)`, any other constraint (regex, email, unique, length, …),
   * or `Rule.min/max` on a non-array (where they bound value rather than
   * cardinality). The emitter surfaces this as a `custom` marker in the
   * cardinality bracket, e.g. `+title: string [1, custom]`.
   */
  hasCustomMarker: boolean
}

export interface CanonicalClass {
  name: string
  stereotype: Stereotype
  /**
   * Editorial origin — distinguishes hoisted named object types from
   * anonymous inline objects from image types, even though all three
   * render with the same `<<object>>` stereotype tag.
   */
  origin: ClassOrigin
  fields: CanonicalField[]
}

export interface CanonicalModel {
  classes: CanonicalClass[]
  edges: Edge[]
  warnings: string[]
}

// Loose input shape — we treat the input as a list of objects with at least
// `name` and `type`. Sanity's full SchemaTypeDefinition is much richer; the
// walker reads only what it needs.
interface RawReferenceTarget {
  type: string
}

interface RawArrayMember {
  type: string
  to?: RawReferenceTarget[]
  /** Present on inline anonymous object members of an array. */
  fields?: RawField[]
}

interface RawField {
  name: string
  type: string
  of?: RawArrayMember[]
  to?: RawReferenceTarget[]
  /** Present on inline anonymous objects declared directly as a field (`type: 'object'`). */
  fields?: RawField[]
  validation?: (Rule: unknown) => unknown
}

interface RawType {
  name: string
  type: string
  fields?: RawField[]
  /** Present on inline-alias types like `defineType({name: 'foo', type: 'reference', to: [...]})`. */
  to?: RawReferenceTarget[]
}

// Platform metadata fields auto-injected by Sanity onto documents — never
// part of the user-authored content model. Mirrors the list in ADR 0006.
const SKIP_FIELD_NAMES = new Set([
  '_id',
  '_type',
  '_createdAt',
  '_updatedAt',
  '_rev',
  '_key',
  '_weak',
])

// Sanity field types we surface as primitives, mapped to the label shown
// in the diagram. `slug` becomes `string` per ADR 0006; `url` is its own
// label because the distinction is meaningful in a content model (and is
// the type we synthesise for image asset references — see image-like
// handling below).
const PRIMITIVE_TYPES: Record<string, PrimitiveKind> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  slug: 'string',
  url: 'url',
}

// Fields auto-injected by Sanity onto image types — generally absent from
// user-written `defineType` field lists, but skipped defensively if they
// do appear. The `asset` field is treated separately: it's synthesised
// onto every image-like class as a primitive `url` field so the asset
// reference is visible rather than implicit.
const IMAGE_INTERNAL_FIELD_NAMES = new Set(['hotspot', 'crop', 'media'])

// Type-name patterns that are not part of the user-authored content model.
// Mirrors the skip rules in ADR 0006.
const SKIP_TYPE_PATTERNS: RegExp[] = [
  /^sanity\./, // Sanity-internal helpers (imageAsset, hotspot, crop, …)
  /^assist\./, // @sanity/assist plugin documents/types
  /^geopoint$/, // not modelled
]

function shouldSkipTypeName(name: string): boolean {
  return SKIP_TYPE_PATTERNS.some((p) => p.test(name))
}

const pascalCase = (s: string): string =>
  s.replace(/(^|[._-])([a-z])/g, (_, __, c: string) => c.toUpperCase())

/**
 * Decide whether a top-level type, when referenced by name from a field,
 * should resolve to a composition edge to its own class. Documents,
 * objects, and image types qualify (all of which are emitted as classes
 * by `walk`); primitive aliases and skipped types do not.
 */
function isClassType(t: RawType): boolean {
  return t.type === 'document' || t.type === 'object' || t.type === 'image'
}

/**
 * Resolve a named type to a field characterisation appropriate for the
 * given array context. Handles class composition and reference aliases
 * (top-level `defineType` whose `type` is `reference`). Returns null if
 * the type isn't something we know how to surface.
 */
function resolveNamedType(
  named: RawType,
  array: boolean,
): ObjectChar | null {
  if (isClassType(named)) {
    return {kind: 'object', target: pascalCase(named.name), relation: 'composition', array}
  }
  // Inline-alias to a reference: e.g.
  //   defineType({name: 'referencedDiscipline', type: 'reference', to: [{type: 'discipline'}]})
  if (named.type === 'reference') {
    const target = named.to?.[0]?.type
    if (!target) return null
    return {kind: 'object', target: pascalCase(target), relation: 'reference', array}
  }
  return null
}

function characterize(field: RawField, typeMap: Map<string, RawType>): FieldChar | null {
  // Direct primitive: { name: 'title', type: 'string' }
  const prim = PRIMITIVE_TYPES[field.type]
  if (prim) return {kind: 'primitive', prim, array: false}

  // Reference: { name: 'foo', type: 'reference', to: [{type: 'discipline'}] }
  if (field.type === 'reference') {
    const target = field.to?.[0]?.type
    if (!target) return null
    return {kind: 'object', target: pascalCase(target), relation: 'reference', array: false}
  }

  // Portable Text: an array whose `of` members include `block`. Sanity
  // portable text is structurally an array of blocks (often mixed with
  // inline image/custom-block types), but we treat it semantically as a
  // single body of content — scalar in the diagram, no edge, no class.
  if (
    field.type === 'array' &&
    field.of &&
    field.of.some((m) => m.type === 'block')
  ) {
    return {kind: 'portableText'}
  }

  // Array: characterise the inner type and set array: true. We use the
  // first member of `of` to determine the inner type; multi-type arrays
  // (where `of` has more than one entry) need richer handling and will
  // be addressed in a later cycle.
  if (field.type === 'array' && field.of && field.of.length > 0) {
    const inner = field.of[0]
    if (!inner) return null
    const innerPrim = PRIMITIVE_TYPES[inner.type]
    if (innerPrim) return {kind: 'primitive', prim: innerPrim, array: true}
    if (inner.type === 'reference') {
      const target = inner.to?.[0]?.type
      if (!target) return null
      return {kind: 'object', target: pascalCase(target), relation: 'reference', array: true}
    }
    // Inner type is a named class or an alias? Resolve through typeMap.
    const namedInner = typeMap.get(inner.type)
    if (namedInner) {
      const resolved = resolveNamedType(namedInner, true)
      if (resolved) return resolved
    }
  }

  // Named type referenced by name. Could be a kept class (composition)
  // or an inline-alias to a reference (resolved through to its target).
  const named = typeMap.get(field.type)
  if (named) {
    const resolved = resolveNamedType(named, false)
    if (resolved) return resolved
  }

  return null
}

interface FieldValidation {
  cardinality: Cardinality
  hasCustomMarker: boolean
}

function fieldValidation(field: RawField, array: boolean): FieldValidation {
  const result = field.validation ? probe(field.validation) : undefined
  const required = result?.required ?? false

  if (array) {
    // For arrays, Rule.min/Rule.max constrain element count and override
    // the default cardinality bounds. Required only sets the lower bound
    // when probe.min didn't already.
    const min = result?.min ?? (required ? 1 : 0)
    const max: number | '*' = result?.max ?? '*'
    return {
      cardinality: {min, max},
      hasCustomMarker: result?.hasCustom === true || result?.hasOtherConstraints === true,
    }
  }

  // For non-arrays, Rule.min/Rule.max are value constraints (string length,
  // numeric range), not cardinality. They count toward the custom marker.
  const nonArrayValueConstraint =
    result?.min !== undefined || result?.max !== undefined
  return {
    cardinality: {min: required ? 1 : 0, max: 1},
    hasCustomMarker:
      result?.hasCustom === true ||
      result?.hasOtherConstraints === true ||
      nonArrayValueConstraint,
  }
}

/**
 * Build the synthetic `asset: url` field that we prepend to every
 * image-like class. The asset is required (an image without an asset
 * isn't meaningful) and has no other validation.
 */
function syntheticAssetField(): CanonicalField {
  return {
    name: 'asset',
    char: {kind: 'primitive', prim: 'url', array: false},
    cardinality: {min: 1, max: 1},
    hasCustomMarker: false,
  }
}

/**
 * Mutable context threaded through the recursive walk. Replaces the long
 * positional-argument list `walkFields` would otherwise require — adding
 * collection state (warnings, inline-name counts, named-class set) only
 * matters at the WalkContext layer, not at every call site.
 */
interface WalkContext {
  typeMap: Map<string, RawType>
  classes: CanonicalClass[]
  edges: Edge[]
  warnings: string[]
  /** Bare class name → number of inline-object claims on it across the schema. */
  inlineCounts: Map<string, number>
  /** Bare class names already claimed by top-level named classes. */
  namedClassNames: Set<string>
  /** Bare names we've already emitted a collision warning for. */
  collisionWarningsEmitted: Set<string>
}

/**
 * Detect an inline anonymous object inside a field, either directly
 * (`type: 'object'` with `fields`) or as the inner type of an array
 * (`of: [{type: 'object', fields: [...]}]`). Returns the inline object's
 * raw fields plus whether the field is an array, or null if no inline
 * object is present.
 */
function inlineObjectFor(
  field: RawField,
): {innerFields: RawField[]; array: boolean} | null {
  if (field.type === 'object' && field.fields) {
    return {innerFields: field.fields, array: false}
  }
  if (field.type === 'array' && field.of) {
    for (const inner of field.of) {
      if (inner.type === 'object' && inner.fields) {
        return {innerFields: inner.fields, array: true}
      }
    }
  }
  return null
}

/**
 * Resolve the class name for an inline anonymous object. Uses the bare
 * pascalCase of the field name unless it would collide with another inline
 * (same bare name elsewhere) or a named class — in which case it gets
 * parent-prefixed (`MethodMetadata`).
 */
function resolveInlineClassName(
  fieldName: string,
  parentClassName: string,
  ctx: WalkContext,
): string {
  const bare = pascalCase(fieldName)
  const collidesWithNamed = ctx.namedClassNames.has(bare)
  const multipleInlines = (ctx.inlineCounts.get(bare) ?? 0) > 1
  if (collidesWithNamed || multipleInlines) {
    return parentClassName + bare
  }
  return bare
}

function maybeEmitCollisionWarning(fieldName: string, ctx: WalkContext): void {
  const bare = pascalCase(fieldName)
  if (ctx.collisionWarningsEmitted.has(bare)) return

  const collidesWithNamed = ctx.namedClassNames.has(bare)
  const inlineCount = ctx.inlineCounts.get(bare) ?? 0

  if (collidesWithNamed && inlineCount > 0) {
    ctx.warnings.push(
      `Inline object '${fieldName}' collides with named class '${bare}'; emitted with parent prefix.`,
    )
    ctx.collisionWarningsEmitted.add(bare)
  } else if (inlineCount > 1) {
    ctx.warnings.push(
      `Inline object '${fieldName}' appears in multiple classes; emitted with parent prefix to disambiguate.`,
    )
    ctx.collisionWarningsEmitted.add(bare)
  }
}

/**
 * Recursively count how often each inline-object bare name appears across
 * the schema. Used by `resolveInlineClassName` to decide which inlines
 * need parent-prefixing.
 */
function collectInlineCounts(
  rawFields: RawField[] | undefined,
  out: Map<string, number>,
): void {
  if (!rawFields) return
  for (const f of rawFields) {
    if (SKIP_FIELD_NAMES.has(f.name)) continue
    const inline = inlineObjectFor(f)
    if (inline) {
      const bare = pascalCase(f.name)
      out.set(bare, (out.get(bare) ?? 0) + 1)
      // Recurse — nested inline objects also need to be counted so they
      // can be disambiguated against each other.
      collectInlineCounts(inline.innerFields, out)
    }
  }
}

function walkFields(
  rawFields: RawField[] | undefined,
  sourceClassName: string,
  parentType: string,
  ctx: WalkContext,
): CanonicalField[] {
  const out: CanonicalField[] = []
  const isImageLike = parentType === 'image'

  // Image-like classes always start with a synthetic `asset: url` field so
  // the asset reference is explicit in the diagram. User-declared fields
  // follow in their declaration order.
  if (isImageLike) {
    out.push(syntheticAssetField())
  }

  if (rawFields) {
    for (const f of rawFields) {
      if (SKIP_FIELD_NAMES.has(f.name)) continue
      if (isImageLike && IMAGE_INTERNAL_FIELD_NAMES.has(f.name)) continue
      // Never re-emit `asset` from raw fields — the synthetic version above
      // is the canonical one; treating a user-declared override as a no-op
      // matches Sanity's own behaviour of always injecting it.
      if (isImageLike && f.name === 'asset') continue

      // Inline anonymous object: emit a new class for it, recurse into its
      // fields, and add a composition edge. Resolution of the class name
      // honours the disambiguation rule (bare unless colliding).
      const inline = inlineObjectFor(f)
      if (inline) {
        const className = resolveInlineClassName(f.name, sourceClassName, ctx)
        maybeEmitCollisionWarning(f.name, ctx)
        ctx.classes.push({
          name: className,
          stereotype: 'object',
          origin: 'inline',
          fields: walkFields(inline.innerFields, className, 'object', ctx),
        })
        const char: ObjectChar = {
          kind: 'object',
          target: className,
          relation: 'composition',
          array: inline.array,
        }
        const v = fieldValidation(f, inline.array)
        out.push({
          name: f.name,
          char,
          cardinality: v.cardinality,
          hasCustomMarker: v.hasCustomMarker,
        })
        ctx.edges.push({
          source: sourceClassName,
          target: className,
          relation: 'composition',
          fieldName: f.name,
        })
        continue
      }

      const char = characterize(f, ctx.typeMap)
      if (!char) continue
      const v = fieldValidation(f, isArrayChar(char))
      out.push({
        name: f.name,
        char,
        cardinality: v.cardinality,
        hasCustomMarker: v.hasCustomMarker,
      })
      if (char.kind === 'object') {
        ctx.edges.push({
          source: sourceClassName,
          target: char.target,
          relation: char.relation,
          fieldName: f.name,
        })
      }
    }
  }
  return out
}

export function walk(types: unknown[]): CanonicalModel {
  const rawTypes = types as RawType[]

  // Pre-pass A: index every type by name so field-level characterisation
  // can resolve named class references and follow inline aliases. The
  // typeMap deliberately includes skipped names — we still need to know
  // they exist so we can detect and drop edges that target them.
  const typeMap = new Map<string, RawType>()
  for (const t of rawTypes) typeMap.set(t.name, t)

  // Pre-pass B: collect the bare class names of every emitted top-level
  // class, plus per-bare-name counts of inline-object claims. Both feed
  // into inline naming: a bare name is available only when it's claimed
  // exactly once and not by a named class.
  const namedClassNames = new Set<string>()
  for (const t of rawTypes) {
    if (shouldSkipTypeName(t.name)) continue
    if (t.type === 'document' || t.type === 'object' || t.type === 'image') {
      namedClassNames.add(pascalCase(t.name))
    }
  }
  const inlineCounts = new Map<string, number>()
  for (const t of rawTypes) {
    if (shouldSkipTypeName(t.name)) continue
    if (t.type === 'document' || t.type === 'object' || t.type === 'image') {
      collectInlineCounts(t.fields, inlineCounts)
    }
  }

  const ctx: WalkContext = {
    typeMap,
    classes: [],
    edges: [],
    warnings: [],
    inlineCounts,
    namedClassNames,
    collisionWarningsEmitted: new Set(),
  }

  for (const t of rawTypes) {
    if (shouldSkipTypeName(t.name)) continue
    const className = pascalCase(t.name)
    if (t.type === 'document') {
      ctx.classes.push({
        name: className,
        stereotype: 'document',
        origin: 'document',
        fields: walkFields(t.fields, className, t.type, ctx),
      })
    } else if (t.type === 'object') {
      ctx.classes.push({
        name: className,
        stereotype: 'object',
        origin: 'object',
        fields: walkFields(t.fields, className, t.type, ctx),
      })
    } else if (t.type === 'image') {
      ctx.classes.push({
        name: className,
        stereotype: 'object',
        origin: 'image',
        fields: walkFields(t.fields, className, t.type, ctx),
      })
    }
  }

  // Post-pass: drop edges whose target isn't actually an emitted class. This
  // happens when a reference points at a skipped type (e.g. sanity.imageAsset)
  // or a type that wasn't declared. Warn so the user knows the diagram is
  // incomplete versus the schema.
  const emittedClassNames = new Set(ctx.classes.map((c) => c.name))
  const keptEdges: Edge[] = []
  for (const e of ctx.edges) {
    if (emittedClassNames.has(e.target)) {
      keptEdges.push(e)
    } else {
      ctx.warnings.push(
        `Edge for field '${e.fieldName}' on ${e.source} dropped — target type '${e.target}' is filtered or not declared.`,
      )
    }
  }

  // Post-pass: warn when the same field name appears across classes with
  // structurally different characterisations. Mermaid emits each class's
  // field independently so there's no structural collision — but the name
  // reuse is a modeling smell. Suppress when an inline-object collision
  // was already reported for the same bare name (the char.target differs
  // by construction in that case and we don't want to double-warn).
  const fieldSignatures = new Map<string, Set<string>>()
  for (const cls of ctx.classes) {
    for (const f of cls.fields) {
      let sigs = fieldSignatures.get(f.name)
      if (!sigs) {
        sigs = new Set()
        fieldSignatures.set(f.name, sigs)
      }
      sigs.add(charSignature(f.char))
    }
  }
  for (const [name, sigs] of fieldSignatures) {
    if (sigs.size <= 1) continue
    if (ctx.collisionWarningsEmitted.has(pascalCase(name))) continue
    ctx.warnings.push(
      `Field '${name}' has differing types across classes (${[...sigs].sort().join(', ')}); the diagram shows each class's own field but the name reuse may be worth reviewing.`,
    )
  }

  // Deterministic ordering for stable git diffs. Documents alphabetical
  // first, then objects alphabetical; edges by (source, fieldName, target);
  // field order within a class is left as authored, because the schema
  // file's field order conveys deliberate Studio UX choice.
  const sortedClasses = [...ctx.classes].sort((a, b) => {
    if (a.stereotype !== b.stereotype) {
      return a.stereotype === 'document' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
  const sortedEdges = [...keptEdges].sort(
    (a, b) =>
      a.source.localeCompare(b.source) ||
      a.fieldName.localeCompare(b.fieldName) ||
      a.target.localeCompare(b.target),
  )

  return {classes: sortedClasses, edges: sortedEdges, warnings: ctx.warnings}
}

/** Compact textual signature of a char for collision-detection purposes. */
function charSignature(char: FieldChar): string {
  if (char.kind === 'primitive') return `${char.prim}${char.array ? '[]' : ''}`
  if (char.kind === 'portableText') return 'portableText'
  return `${char.target}${char.array ? '[]' : ''}`
}
