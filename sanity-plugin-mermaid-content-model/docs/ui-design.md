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

- [ ] Inline objects *(master toggle — see "dependent objects" below)*
- [ ] Attributes
- [ ] Portable Text Blocks *(master toggle — see "dependent objects" below)*
- **Documents**
  - [ ] `{document name}` … (one per document)
- **Objects** — header carries a **Hide Orphan Objects** button beneath it (see below)
  - [ ] `{object name}` … (one per object)

**Dependent objects (inline & portable-text) follow their parent.** These classes have no individual switch — they are inherently part of whatever contains them. So they are shown only when **reachable from a visible document** (documents-as-boundaries; same reachability as orphans), and auto-hide when their document is hidden. The "Inline objects" / "Portable Text Blocks" toggles are *master* on/off switches: off hides that kind entirely; on shows it *when connected to a visible document*. They are **not** affected by "Hide Orphan Objects" (that's named objects only). Implemented in `resolveElements`.

**Hide Orphan Objects** (implemented). A one-shot button at the top of the Objects group. "Orphan" = a currently-visible object/image/file class **not reachable from any currently-visible document**. Reachability (shared `reachableClasses`):

- **treats documents as boundaries** — traversal starts at visible documents and expands through objects (composition *and* reference edges) but stops at any other document, so hiding `Resource` orphans the objects only `Resource` used, even if another visible document references `Resource`; and
- **cuts at category-hidden connectors** — a hidden inline or portable-text node stops conducting, so a named object connected to a document *only* through a hidden Portable Text block (or inline object) strands and becomes an orphan. (Turning the "Portable Text Blocks" / "Inline objects" category off therefore surfaces such objects to this button.)

Pressing it flips those objects' switches off (visible and individually reversible). Disabled with a "No orphan objects visible" tooltip when there are none. Inline/portable-text classes are out of scope as *targets* (no individual switch; auto-hidden by `resolveElements`). Logic: pure `orphanObjects(model, selection)`.

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

## Deferred decisions

Choices consciously postponed until the relevant feature is functional, so we judge them against real diagrams rather than speculatively.

- **Orphan objects — RESOLVED (built as the "Hide Orphan Objects" button).** Two distinct things, both settled:
  - **Field rows that reference a hidden class are intentionally KEPT.** Hide `HeroImage` and `Method` still showing `+heroImage: HeroImage` (with no box/edge) is *desired* — a document should always list its own attributes, regardless of whether the referenced object is currently shown. No change planned.
  - **Hiding orphan objects is now an explicit one-shot button, not auto-cascade.** We rejected automatic select/deselect-on-document-change as too fussy/opaque. Instead, "Hide Orphan Objects" lets the user act deliberately and see/reverse the result (see the Elements-menu spec above for the full semantics — documents-as-boundaries reachability, one-shot, disabled when none).
- **Per-item default element visibility — still deferred.** e.g. Portable Text Blocks unchecked by default. The selection model (`defaultSelection`) is the single seam for this; not yet built. (No longer coupled to the orphan work, which is done.)

- **Re-showing a document should bring its connected objects back (derived object visibility) — DEFERRED to an iteration phase after the foundation is built.** *Today's behavior:* per-object switches are sticky booleans. Hiding a document leaves its named objects floating as orphans (the button cleans them up); re-showing a document does **not** bring previously-hidden objects back — their switch stays off. Andy finds the "objects follow the documents I'm inspecting" direction more natural, but we're deliberately not rushing it: by the time the plugin is in real use, the desired direction may have shifted. Two ways to integrate it, with tradeoffs:
  - **Option A — derived visibility with overrides (the "right" model).** A non-document class is visible *by default* iff reachable from a visible document; the per-object switch becomes an explicit override (force-show / force-hide). Re-showing a document re-derives, so its objects return automatically, and it cleanly distinguishes a *deliberate* hide from an *orphan*. **Cost:** a refactor of the core selection model (`classes` boolean map → overrides), `defaultSelection`/`resolveElements`/`orphanObjects`, the switch-toggle logic, and the tests — and it largely **retires the explicit "Hide Orphan Objects" button** (orphans just auto-hide). A revised architectural direction.
  - **Option B — cascade-on-show (small, interim).** Keep today's model; when a document is switched on (or "show all documents"), also switch its newly-reachable objects on. Keeps the orphan button. **Cost/caveat:** booleans can't distinguish an orphan-hide from a deliberate hide, so re-showing a document re-shows *all* its connected objects — even one you'd deliberately hidden. Likely partly reworked when/if Option A lands.
  - **Recommendation:** defer to a dedicated iteration phase after the foundational phases (theme, Copy PNG, zoom/pan). Issue #1's "dependent objects follow their parent" fix is already a stepping stone toward Option A. The connector-cut reachability fix (named objects stranded by a hidden Portable Text/inline connector become orphans) is *not* part of this deferral — it's implemented now.

## Phased build plan

Each phase is TDD'd and paused for review, as established in Steps A/B and ADR 0007.

- **Phase 1 — Tool shell + diagram render (current).** Top-nav tool; Vision-like full-height layout (top bar placeholder + work area); `useSchema → buildDiagram → render SVG`; warning display; wire into `studio/` and verify live that `skosConcept` edges appear. Uses the existing default `classDef` colours for now.
- **Phase 2 — Copy Code.** Top-bar control → clipboard + toast.
- **Phase 3 — Elements menu + filtering.** (3a) pure `filterModel` transform + `emit` "attributes" option; (3b) the Elements overlay wired to live updates. Built on the resolvable-selection model.
- **Phase 4 — Theme.** Light/dark document/object palettes via parameterised `emit`; hook Studio color-scheme preference.
- **Phase 5 — Copy PNG.** SVG → canvas → PNG blob → clipboard + toast.
- **Phase 6 — Zoom / pan.** Default Mermaid-viewer affordance.
- **Later / optional — drag-to-rearrange.** Needs a non-Mermaid rendering approach or post-render SVG manipulation; scoped separately if pursued.
