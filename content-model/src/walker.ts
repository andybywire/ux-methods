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
export type PrimitiveKind = 'string' | 'number' | 'boolean' | 'url' | 'datetime' | 'geopoint'
export type Relation = 'composition' | 'reference'

/**
 * Editorial origin of a canonical class — preserved separately from
 * `stereotype` (the rendering decision) so downstream consumers can
 * filter on what a class actually came from. The plugin UI's expected
 * use is "let the user hide all inline objects" or "hide all images";
 * those questions can't be answered from `stereotype` alone since
 * `object`, `image`, and `inline` all render with the `<<object>>` tag.
 */
export type ClassOrigin = 'document' | 'object' | 'image' | 'file' | 'inline' | 'portableText'

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
 *
 * Block-only portable text (whether inline or via a named alias) uses
 * this char. Portable text that ALSO contains structural embeds (e.g. a
 * bodyImage alongside block) is promoted to its own class — see the
 * "structural portable text" handling in walker.
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

/**
 * Sanity accepts `to` as either an array `[{type: 'X'}]` or a single
 * object `{type: 'X'}` when there's only one target. Modeling the input
 * union explicitly so we can normalise it in one place.
 */
type RawReferenceTo = RawReferenceTarget | RawReferenceTarget[]

interface RawArrayMember {
  type: string
  to?: RawReferenceTo
  /** Present on inline anonymous object members of an array. */
  fields?: RawField[]
}

interface RawField {
  name: string
  type: string
  of?: RawArrayMember[]
  to?: RawReferenceTo
  /** Present on inline anonymous objects declared directly as a field (`type: 'object'`). */
  fields?: RawField[]
  validation?: (Rule: unknown) => unknown
}

interface RawType {
  name: string
  type: string
  fields?: RawField[]
  /** Present on inline-alias types like `defineType({name: 'foo', type: 'reference', to: [...]})`. */
  to?: RawReferenceTo
  /** Present on named array-alias types like `defineType({name: 'foo', type: 'array', of: [...]})`. */
  of?: RawArrayMember[]
}

/**
 * Normalise the `to` value to its first target's type name, accepting
 * either Sanity's array form `[{type: 'X'}]` or single-object form
 * `{type: 'X'}`. Returns undefined when neither form yields a target.
 */
function firstReferenceTarget(to: RawReferenceTo | undefined): string | undefined {
  if (!to) return undefined
  if (Array.isArray(to)) return to[0]?.type
  return to.type
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

// Sanity field types we surface as primitives, mapped to the display label
// shown in the diagram. The full set of intrinsic primitive-ish types per
// reference.sanity.io's IntrinsicDefinitions is covered here.
//
// Mapping rationale:
// - `text` collapses to `string` — Sanity's `text` is a multi-line string
//   editor; structurally identical at the data layer.
// - `email` collapses to `string` — string with regex validation.
// - `slug` collapses to `string` per ADR 0006 (the slug `current` is the
//   value that matters; the `_type` wrapper is uninteresting in a content
//   model view).
// - `url` keeps its own label — meaningful semantic distinction, and it's
//   the label we synthesise for image/file asset references.
// - `date` and `datetime` collapse to a shared `datetime` label — same
//   editorial idea ("a moment in time"), different UI affordance.
// - `geopoint` keeps its own label — structurally a `{lat, lng}` object,
//   but at the diagram level it's a leaf value with its own semantic.
const PRIMITIVE_TYPES: Record<string, PrimitiveKind> = {
  string: 'string',
  text: 'string',
  email: 'string',
  slug: 'string',
  number: 'number',
  boolean: 'boolean',
  url: 'url',
  date: 'datetime',
  datetime: 'datetime',
  geopoint: 'geopoint',
}

// Sanity reference variants that all behave the same way for diagram
// purposes: pull the target from `to[0].type` and emit an association
// edge. `crossDatasetReference` and `globalDocumentReference` differ in
// runtime resolution (across-dataset / across-project) but the diagram
// just shows the relationship.
const REFERENCE_TYPES = new Set(['reference', 'crossDatasetReference', 'globalDocumentReference'])

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
 * given array context. Handles class composition, reference aliases
 * (`defineType({type: 'reference', to: ...})`), and array aliases
 * (`defineType({type: 'array', of: [...]})` — including portable text).
 * Returns null if the type isn't something we know how to surface.
 */
function resolveNamedType(
  named: RawType,
  array: boolean,
  typeMap: Map<string, RawType>,
): FieldChar | null {
  if (isClassType(named)) {
    return {kind: 'object', target: pascalCase(named.name), relation: 'composition', array}
  }
  // Inline-alias to a reference: e.g.
  //   defineType({name: 'referencedDiscipline', type: 'reference', to: [{type: 'discipline'}]})
  if (named.type === 'reference') {
    const target = firstReferenceTarget(named.to)
    if (!target) return null
    return {kind: 'object', target: pascalCase(target), relation: 'reference', array}
  }
  // Inline-alias to an array. Three sub-cases:
  //  - Structural portable text (block + class-able embeds) → resolves
  //    to a composition edge to the alias's own class (which walk()
  //    emits separately). Two-hop relationship preserved: parent →
  //    wrapper → embedded type.
  //  - Block-only portable text → scalar PortableText label (no class).
  //  - Any other array shape (primitives, references) → behaves like
  //    an inline array field at the call site.
  if (named.type === 'array' && named.of) {
    if (structuralPortableTextEmbeds(named.of, typeMap)) {
      return {
        kind: 'object',
        target: pascalCase(named.name),
        relation: 'composition',
        array,
      }
    }
    return characterizeArrayMembers(named.of, typeMap)
  }
  return null
}

/**
 * Detect "structural portable text": an array whose `of` contains
 * `block` AND at least one class-able member (a named class type or
 * a reference). Returns the list of structural members if so, or null
 * if `of` isn't portable text at all or is block-only.
 *
 * Block-only portable text stays as scalar `PortableTextChar` (used for
 * the common case of inline `overview` / `colophon` fields). Structural
 * portable text gets promoted to its own class so embedded types stay
 * connected to the diagram via their natural two-hop relationship
 * (parent → portable-text wrapper → embedded type) rather than being
 * dropped as orphans.
 */
function structuralPortableTextEmbeds(
  of: RawArrayMember[] | undefined,
  typeMap: Map<string, RawType>,
): RawArrayMember[] | null {
  if (!of || !of.some((m) => m.type === 'block')) return null

  const embeds: RawArrayMember[] = []
  for (const member of of) {
    if (member.type === 'block') continue
    if (PRIMITIVE_TYPES[member.type]) continue
    if (REFERENCE_TYPES.has(member.type)) {
      if (firstReferenceTarget(member.to)) embeds.push(member)
      continue
    }
    const named = typeMap.get(member.type)
    if (named && isClassType(named)) embeds.push(member)
  }
  return embeds.length > 0 ? embeds : null
}

/** The synthetic `+block: PortableText [0..*]` field present on every
 * structural-portable-text class. Mirrors the synthetic asset on
 * image-like classes: makes the inherent content visible rather than
 * leaving it implicit. */
function syntheticBlockField(): CanonicalField {
  return {
    name: 'block',
    char: {kind: 'portableText'},
    cardinality: {min: 0, max: '*'},
    hasCustomMarker: false,
  }
}

/**
 * Build the canonical fields for a structural-portable-text class:
 * synthetic block field first, then one field per non-block class-able
 * embed (composition or reference). Also pushes the outgoing edges to
 * `edges` since the embeds are object-kinded.
 */
function buildPortableTextClassFields(
  of: RawArrayMember[],
  sourceClassName: string,
  typeMap: Map<string, RawType>,
  edges: Edge[],
): CanonicalField[] {
  const fields: CanonicalField[] = [syntheticBlockField()]
  for (const member of of) {
    if (member.type === 'block') continue
    if (PRIMITIVE_TYPES[member.type]) continue

    let char: ObjectChar | null = null
    let fieldName = ''

    if (REFERENCE_TYPES.has(member.type)) {
      const target = firstReferenceTarget(member.to)
      if (!target) continue
      char = {
        kind: 'object',
        target: pascalCase(target),
        relation: 'reference',
        array: true,
      }
      // Use the target's name as the field name; portable-text references
      // don't have a field name of their own in the schema, so we name
      // them by what they point at.
      fieldName = target
    } else {
      const named = typeMap.get(member.type)
      if (!named || !isClassType(named)) continue
      char = {
        kind: 'object',
        target: pascalCase(named.name),
        relation: 'composition',
        array: true,
      }
      fieldName = member.type
    }

    fields.push({
      name: fieldName,
      char,
      cardinality: {min: 0, max: '*'},
      hasCustomMarker: false,
    })
    edges.push({
      source: sourceClassName,
      target: char.target,
      relation: char.relation,
      fieldName,
    })
  }
  return fields
}

/**
 * Characterise the contents of an array `of: [...]` declaration. Used
 * by both inline array fields (`{type: 'array', of: [...]}`) and by
 * named array aliases (`defineType({type: 'array', of: [...]})`) — the
 * latter via resolveNamedType.
 *
 * Returns a FieldChar whose `array` flag is true for non-portable-text
 * cases, or a PortableTextChar (always scalar) when the array is
 * block-only portable text. Callers handle structural portable text
 * (block + embeds) separately because it needs to emit a class, not
 * just characterise a field.
 */
function characterizeArrayMembers(
  of: RawArrayMember[],
  typeMap: Map<string, RawType>,
): FieldChar | null {
  // Portable Text: any `of` member is `block`. Sanity portable text is
  // structurally an array of blocks (often mixed with inline image or
  // custom inline-block types). The block-only case (the common case
  // for inline portable text fields like `overview`) surfaces as a
  // scalar PortableText label. Portable text that ALSO contains
  // class-able embeds is handled higher up — promoted to its own
  // class so embedded types stay connected.
  if (of.some((m) => m.type === 'block')) {
    return {kind: 'portableText'}
  }

  const inner = of[0]
  if (!inner) return null

  const innerPrim = PRIMITIVE_TYPES[inner.type]
  if (innerPrim) return {kind: 'primitive', prim: innerPrim, array: true}

  if (REFERENCE_TYPES.has(inner.type)) {
    const target = firstReferenceTarget(inner.to)
    if (!target) return null
    return {kind: 'object', target: pascalCase(target), relation: 'reference', array: true}
  }

  // Named class or alias as inner type — recurse through typeMap. The
  // resolution honours the same rules as a top-level field, so an
  // array-of-aliased-references resolves to the right target.
  const namedInner = typeMap.get(inner.type)
  if (namedInner) {
    return resolveNamedType(namedInner, true, typeMap)
  }

  return null
}

function characterize(field: RawField, typeMap: Map<string, RawType>): FieldChar | null {
  // Direct primitive: { name: 'title', type: 'string' }
  const prim = PRIMITIVE_TYPES[field.type]
  if (prim) return {kind: 'primitive', prim, array: false}

  // Reference variants: `reference`, `crossDatasetReference`, `globalDocumentReference`.
  // All three behave the same for diagram purposes — extract the first
  // target type and emit an association edge.
  if (REFERENCE_TYPES.has(field.type)) {
    const target = firstReferenceTarget(field.to)
    if (!target) return null
    return {kind: 'object', target: pascalCase(target), relation: 'reference', array: false}
  }

  // Inline array. Characterise the contents via the shared helper —
  // same logic applies to a `defineType({type: 'array', ...})` alias
  // resolved via typeMap.
  if (field.type === 'array' && field.of && field.of.length > 0) {
    return characterizeArrayMembers(field.of, typeMap)
  }

  // Named type referenced by name. Could be a kept class (composition),
  // an inline-alias to a reference (resolved through to its target),
  // or an inline-alias to an array — including portable text.
  const named = typeMap.get(field.type)
  if (named) {
    return resolveNamedType(named, false, typeMap)
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
  // Image and file types share the asset-reference structure — both
  // wrap a Sanity asset and benefit from the same synthetic field
  // treatment. The two are kept distinct at the origin level for
  // filtering, but the field-walking logic is the same.
  const isAssetLike = parentType === 'image' || parentType === 'file'

  // Asset-like classes always start with a synthetic `asset: url` field
  // so the asset reference is explicit in the diagram. User-declared
  // fields follow in their declaration order.
  if (isAssetLike) {
    out.push(syntheticAssetField())
  }

  if (rawFields) {
    for (const f of rawFields) {
      if (SKIP_FIELD_NAMES.has(f.name)) continue
      if (isAssetLike && IMAGE_INTERNAL_FIELD_NAMES.has(f.name)) continue
      // Never re-emit `asset` from raw fields — the synthetic version above
      // is the canonical one; treating a user-declared override as a no-op
      // matches Sanity's own behaviour of always injecting it.
      if (isAssetLike && f.name === 'asset') continue

      // Inline structural portable text:
      //   `{type: 'array', of: [{type: 'block'}, {type: 'someEmbed'}, …]}`
      // emit an anonymous class with synthetic `+block: PortableText [0..*]`
      // plus a field per structural embed. Same inline-naming policy as
      // inline objects (bare pascalCase unless colliding).
      if (
        f.type === 'array' &&
        f.of &&
        structuralPortableTextEmbeds(f.of, ctx.typeMap)
      ) {
        const className = resolveInlineClassName(f.name, sourceClassName, ctx)
        maybeEmitCollisionWarning(f.name, ctx)
        ctx.classes.push({
          name: className,
          stereotype: 'object',
          origin: 'portableText',
          fields: buildPortableTextClassFields(f.of, className, ctx.typeMap, ctx.edges),
        })
        const char: ObjectChar = {
          kind: 'object',
          target: className,
          relation: 'composition',
          array: false,
        }
        // The parent's field is scalar (one body of content per field);
        // the array-ness lives inside the synthesized class's block.
        const v = fieldValidation(f, false)
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
    } else if (t.type === 'file') {
      // File types are handled like image types — both wrap a Sanity
      // asset reference and benefit from the same synthetic `asset: url`
      // treatment. Origin stays distinct so future filtering can hide
      // one without the other.
      ctx.classes.push({
        name: className,
        stereotype: 'object',
        origin: 'file',
        fields: walkFields(t.fields, className, t.type, ctx),
      })
    } else if (t.type === 'array' && structuralPortableTextEmbeds(t.of, typeMap)) {
      // Named structural portable text alias (e.g. bodyPortableText)
      // becomes an object-stereotype class with a synthetic block field
      // plus a field per structural embed. The embeds' edges are
      // pushed to ctx.edges by buildPortableTextClassFields.
      ctx.classes.push({
        name: className,
        stereotype: 'object',
        origin: 'portableText',
        fields: buildPortableTextClassFields(t.of ?? [], className, typeMap, ctx.edges),
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
