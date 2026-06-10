// Elements selection model: the bridge between the Elements menu UI and the
// pure filter pipeline. Holds what the user has toggled, and resolves it to the
// {hidden, attributes} options buildDiagram understands.
//
// Pure and DOM-free, so the menu semantics are unit-tested without rendering.
//
// Future per-item defaults (e.g. Portable Text Blocks off by default) live in
// `defaultSelection` — change what it returns and nothing else moves. That's
// the "resolvable selection" guardrail from docs/ui-design.md.

import type {CanonicalModel, ClassOrigin} from './walker'

export interface ElementsSelection {
  categories: {
    /** Show classes with origin 'inline'. */
    inlineObjects: boolean
    /** Show classes with origin 'portableText'. */
    portableText: boolean
    /** Show field rows inside class boxes (the `emit` attributes option). */
    attributes: boolean
  }
  /**
   * Per-class visibility for individually-listed classes (documents + named
   * objects/images/files). Inline and portableText classes are deliberately
   * absent — they are governed by their category toggle, not listed here.
   */
  classes: Record<string, boolean>
}

export interface ResolvedElements {
  /** Class names to hide; ready for `buildDiagram({hidden})`. */
  hidden: Set<string>
  /** Whether to render field rows. */
  attributes: boolean
}

export interface ElementGroups {
  /** Document class names, in model order. */
  documents: string[]
  /** Named object/image/file class names, in model order. */
  objects: string[]
}

// Origins that get an individual per-class toggle. Inline + portableText are
// excluded: they're controlled in bulk by their category toggles.
const INDIVIDUAL_ORIGINS: ReadonlySet<ClassOrigin> = new Set<ClassOrigin>([
  'document',
  'object',
  'image',
  'file',
])

/**
 * Split the model's classes into the two groups the Elements menu lists
 * individually. Inline + portableText classes are excluded (category-governed).
 * Order follows the model (documents first, then objects, alphabetical).
 */
export function elementGroups(model: CanonicalModel): ElementGroups {
  const documents: string[] = []
  const objects: string[] = []
  for (const c of model.classes) {
    if (c.origin === 'document') documents.push(c.name)
    else if (c.origin === 'object' || c.origin === 'image' || c.origin === 'file') {
      objects.push(c.name)
    }
  }
  return {documents, objects}
}

/**
 * The initial Elements selection: everything visible. The single place future
 * per-item defaults will live (e.g. set `portableText: false`).
 */
export function defaultSelection(model: CanonicalModel): ElementsSelection {
  const classes: Record<string, boolean> = {}
  for (const c of model.classes) {
    if (INDIVIDUAL_ORIGINS.has(c.origin)) classes[c.name] = true
  }
  return {
    categories: {inlineObjects: true, portableText: true, attributes: true},
    classes,
  }
}

const isVisibleClass = (selection: ElementsSelection, name: string): boolean =>
  selection.classes[name] !== false

/**
 * The set of class names reachable from the currently-visible documents.
 * Traversal starts at the visible documents and follows edges (composition and
 * reference), but only *conducts* through nodes that are themselves part of the
 * visible graph:
 *
 * - **Documents are boundaries** — reached but not expanded, so reachability
 *   doesn't cross into a different document's subtree.
 * - **Category-hidden connectors are cut** — an inline or portable-text node
 *   whose category toggle is off is hidden, so it can't carry reachability to
 *   objects beyond it. A named object connected to a document *only* through a
 *   hidden Portable Text block (or inline object) therefore strands — it becomes
 *   an orphan rather than floating with no visible connection.
 *
 * Shared by `resolveElements` (auto-hiding dependent inline/PT classes) and
 * `orphanObjects` (the named-object orphan list).
 */
function reachableClasses(model: CanonicalModel, selection: ElementsSelection): Set<string> {
  const originByName = new Map<string, ClassOrigin>()
  for (const c of model.classes) originByName.set(c.name, c.origin)

  const isDocument = (name: string): boolean => originByName.get(name) === 'document'
  const isCutConnector = (name: string): boolean => {
    const origin = originByName.get(name)
    return (
      (origin === 'inline' && !selection.categories.inlineObjects) ||
      (origin === 'portableText' && !selection.categories.portableText)
    )
  }

  const adjacency = new Map<string, string[]>()
  for (const e of model.edges) {
    const targets = adjacency.get(e.source)
    if (targets) targets.push(e.target)
    else adjacency.set(e.source, [e.target])
  }

  const reachable = new Set<string>()
  const queue: string[] = []
  for (const c of model.classes) {
    if (c.origin === 'document' && isVisibleClass(selection, c.name)) {
      reachable.add(c.name)
      queue.push(c.name)
    }
  }
  while (queue.length > 0) {
    const node = queue.shift()
    if (node === undefined) continue
    for (const target of adjacency.get(node) ?? []) {
      if (reachable.has(target)) continue
      reachable.add(target)
      // Conduct only through visible objects: not documents (boundaries) and not
      // category-hidden connectors (objects reachable only through them strand).
      if (!isDocument(target) && !isCutConnector(target)) queue.push(target)
    }
  }
  return reachable
}

/**
 * Resolve a selection into the hidden-class set + attributes flag for buildDiagram.
 *
 * Inline and portable-text classes are **dependent**: they have no individual
 * switch and only make sense alongside their parent. So they are hidden when
 * their category toggle is off OR when they are not reachable from a visible
 * document — i.e. they follow their parent into and out of view automatically.
 * (Named object/image/file classes are not auto-hidden here; an unreachable one
 * floats as an "orphan" for the user to hide via the button — see `orphanObjects`.)
 */
export function resolveElements(
  model: CanonicalModel,
  selection: ElementsSelection,
): ResolvedElements {
  const reachable = reachableClasses(model, selection)
  const hidden = new Set<string>()

  for (const c of model.classes) {
    if (c.origin === 'inline') {
      if (!selection.categories.inlineObjects || !reachable.has(c.name)) hidden.add(c.name)
    } else if (c.origin === 'portableText') {
      if (!selection.categories.portableText || !reachable.has(c.name)) hidden.add(c.name)
    }
  }
  for (const [name, visible] of Object.entries(selection.classes)) {
    if (!visible) hidden.add(name)
  }

  return {hidden, attributes: selection.categories.attributes}
}

/**
 * Find "orphan" objects: individually-listed object/image/file classes that are
 * currently visible but **not reachable from any currently-visible document**
 * (documents-as-boundaries; see `reachableClasses`). Inline and portable-text
 * classes are never reported — they have no individual switch and are auto-hidden
 * by `resolveElements`. Drives the "Hide Orphan Objects" control. See docs/ui-design.md.
 */
export function orphanObjects(model: CanonicalModel, selection: ElementsSelection): string[] {
  const reachable = reachableClasses(model, selection)
  const orphans: string[] = []
  for (const c of model.classes) {
    const eligible = c.origin === 'object' || c.origin === 'image' || c.origin === 'file'
    if (!eligible) continue
    if (!isVisibleClass(selection, c.name)) continue
    if (!reachable.has(c.name)) orphans.push(c.name)
  }
  return orphans
}
