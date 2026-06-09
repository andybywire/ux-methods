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

/** Resolve a selection into the hidden-class set + attributes flag for buildDiagram. */
export function resolveElements(
  model: CanonicalModel,
  selection: ElementsSelection,
): ResolvedElements {
  const hidden = new Set<string>()

  if (!selection.categories.inlineObjects) {
    for (const c of model.classes) if (c.origin === 'inline') hidden.add(c.name)
  }
  if (!selection.categories.portableText) {
    for (const c of model.classes) if (c.origin === 'portableText') hidden.add(c.name)
  }
  for (const [name, visible] of Object.entries(selection.classes)) {
    if (!visible) hidden.add(name)
  }

  return {hidden, attributes: selection.categories.attributes}
}
