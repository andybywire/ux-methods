# UI design direction

Design intent for the in-Studio tool. Captured from Andy's direction (2026-06-07). Built in phases, each a small TDD chunk (see "Phased build plan").

## Overall layout

Top-nav tool that maximises the space Studio affords plugins for diagram display. Look and feel similar to the **Vision** tool: controls across the top, the bulk of the screen devoted to the work area.

- A **top bar** with the controls below, floated right.
- Diagram zoom and pan controls at their default locations for Mermaid diagrams.

## Controls

Three buttons in the top bar: `[Copy Code] [Copy PNG] [Elements]`

## Elements menu

The **Elements** button reveals a scrollable overlay on the right side of the display, beneath the button (scrollable because the item list can get long). **The diagram updates live when Elements options change.** Initial items:

- [ ] Inline objects
- [ ] Attributes
- [ ] Portable Text Blocks
- **Documents**
  - [ ] `{document name}` … (one per document)
- **Objects**
  - [ ] `{object name}` … (one per object)

**Future (do not build now, do not stub): per-item default selection.** e.g. Portable Text Blocks might default to unchecked. We are not building defaults yet, but the component must not introduce patterns that make adding them hard later — see "Architecture guardrails."

## Theme

- Establish light and dark palettes that distinguish **documents** from **objects** and stay harmonious with the Studio palette.
- Theme defaults to Studio settings — no theme controls in the plugin, but we hook into Studio's color-scheme preference.

## Diagram display

- Zoom and pan, as common Mermaid viewers afford.
- **Drag-to-rearrange** class boxes if it can be added without much hassle. Mermaid renders static SVG and has no native box dragging, so this likely needs an extra library or post-render manipulation — treat as a **subsequent/optional phase**, not part of the core.

## Copy PNG / Copy Code

- **Copy Code:** copies the current Mermaid source to the clipboard.
- **Copy PNG:** copies a PNG of the **currently configured** diagram (i.e. after Elements filtering) to the clipboard, derived from the displayed SVG via canvas.
- Each fires a toast confirming the action.

---

## Architecture guardrails (so later phases stay cheap)

These keep the phased plan from painting us into a corner:

1. **Filtering is a pure transform of the `CanonicalModel`, applied *between* `walk` and `emit`.** Do not bake filtering into the walker or the emitter. A `filterModel(model, selection)` pure function is the seam; `buildDiagram` gains an options argument.
2. **"Attributes" (show/hide field rows) and theme colors are `emit` options, not component logic.** Parameterise `emit-mermaid` (keep it pure) rather than post-processing strings or hardcoding colours in React.
3. **Elements selection is a resolvable model, not hardcoded "all visible."** Represent it so a future per-item *default* layer can sit in front of the user's explicit choices (e.g. `{defaults, overrides}` resolved to an effective selection) without reworking the state shape.
4. **The React component stays a thin renderer.** All testable logic (filter, emit options, PNG-blob construction) lives in pure modules unit-tested without a DOM; the component wires them to Studio (`useSchema`, theme, clipboard, toasts) and is covered by a few jsdom interaction tests with browser APIs mocked.
5. **SVG is canonical for display; PNG is derived from the live SVG.** Keep the rendered SVG self-contained/serializable so canvas export stays clean.

## Phased build plan

Each phase is TDD'd and paused for review, as established in Steps A/B and ADR 0007.

- **Phase 1 — Tool shell + diagram render (current).** Top-nav tool; Vision-like full-height layout (top bar placeholder + work area); `useSchema → buildDiagram → render SVG`; warning display; wire into `studio/` and verify live that `skosConcept` edges appear. Uses the existing default `classDef` colours for now.
- **Phase 2 — Copy Code.** Top-bar control → clipboard + toast.
- **Phase 3 — Elements menu + filtering.** (3a) pure `filterModel` transform + `emit` "attributes" option; (3b) the Elements overlay wired to live updates. Built on the resolvable-selection model.
- **Phase 4 — Theme.** Light/dark document/object palettes via parameterised `emit`; hook Studio color-scheme preference.
- **Phase 5 — Copy PNG.** SVG → canvas → PNG blob → clipboard + toast.
- **Phase 6 — Zoom / pan.** Default Mermaid-viewer affordance.
- **Later / optional — drag-to-rearrange.** Needs a non-Mermaid rendering approach or post-render SVG manipulation; scoped separately if pursued.
