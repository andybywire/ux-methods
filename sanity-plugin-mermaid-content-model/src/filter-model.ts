// Pure filter: hide selected classes from a CanonicalModel.
//
// The seam the Elements menu drives. Per ADR 0006/0007's architecture,
// filtering happens *between* walk and emit — not inside either — so the same
// model can be rendered at different levels of detail without re-walking the
// schema. The UI (Phase 3b) resolves the Elements selection (category toggles,
// per-class toggles, future defaults) into the set of class names to hide; this
// function just applies that set.
//
// See docs/ui-design.md ("Architecture guardrails").

import type {CanonicalModel} from './walker'

/**
 * Return a copy of `model` with the named classes removed and any edge that
 * touches a hidden class (as source or target) dropped. Warnings pass through
 * unchanged — hiding is a view choice, not a modeling change. Does not mutate
 * the input.
 */
export function filterModel(model: CanonicalModel, hidden: ReadonlySet<string>): CanonicalModel {
  return {
    classes: model.classes.filter((c) => !hidden.has(c.name)),
    edges: model.edges.filter((e) => !hidden.has(e.source) && !hidden.has(e.target)),
    warnings: model.warnings,
  }
}
