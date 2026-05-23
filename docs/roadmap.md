# Roadmap

This is the **strategic** view of where UX Methods is headed — themes and phases, not individual tasks. Concrete work items live in [GitHub Issues](https://github.com/andybywire/ux-methods/issues); decisions of record live in [docs/decisions/](decisions/).

The format is intentionally light: a few themes per horizon, with a sentence or two of context each. It should be possible to read this in under a minute and understand what's getting attention.

## Now

*Themes currently getting attention. 1–3 entries is the sweet spot — if there are more, something is probably "Next" in disguise.*

- review and revise use of taxonomies to manage and connect content in Sanity
- restructure external links to use taxonomy / ontology to connect to methods

## Next

*Themes queued behind "Now." Not actively being worked, but the obvious next step.*

- Build ETL to Fuseki (GitHub action ... or Sanity function?)
- Add additional external link instances (bookmarks collections)

## Later

*Direction we believe in but haven't committed to a timeline for. Worth keeping visible so they don't get lost. Grouped by theme / platform surface.*

- revise use of taxonomies — cf [Juan Sequeda post](https://www.linkedin.com/posts/juansequeda_simple-way-of-starting-with-ontologies-start-activity-7400539392827822080-zTM9?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAP_bYYBjNjUGoT5WWWmT1utikzsLJa5nJU) 
- build NLP capabilities for recognizing and tagging facts in external resources
- build resource submission functionality (Chrome plugin)
- plan RSS, llms.txt, [agents.md](http://agents.md), previews, KG functionality
- build method submission functionality

### Studio

- convert to [Symlink & Releases](Symlink & Releases) build workflow
- vet against the [Sanity opinionated guide](https://www.sanity.io/docs/developer-guides/an-opinionated-guide-to-sanity-studio#k29b0ba3b99aa) 
- build newsletter type & related functions

### Astro

- add analytics (Plausible)
- add 404
- reintegrate provenance footnotes

### Model-Driven Design

- capture content model in RDF
- express schema from RDF model

## Out of scope (for now)

*Things people might reasonably ask about that we're deliberately not pursuing right now. Documenting these here avoids re-litigating the same proposals.*

- *placeholder*

## ✅ Completed
*Completed work, reverse chronological.*

### 2026

- rebuild getLinkedData function (Sanity)
- integrate visual editing
- rebuild UXM on Astro

### 2025 

- reframe "post" as "newsletter" — this will have more longevity
- tidy Sanity functions before committing
- tidy branches
- clean up DNS record
- upgrade to Node 22, React 19, and pnpm

---

*Last updated: YYYY-MM-DD*