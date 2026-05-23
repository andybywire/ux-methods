# Collaboration

How we work on UX Methods together — where to find what's happening, how to propose changes, and how to use Claude effectively alongside human collaborators.

UX Methods is small. The norms below are deliberately lightweight; they exist to make actual working together easier, not to impose process for its own sake.

## Getting oriented (new collaborators start here)

The fastest way to get oriented after cloning the repo is to ask Claude to walk you through it. A useful first prompt:

> Read CLAUDE.md, then docs/vision.md and docs/design-principles.md. Then give me a short tour: what each top-level directory is, where the source of truth for content lives, and what's generated vs. hand-edited.

Claude reads the same context files you do, so the tour reflects the project's actual conventions rather than generic guesses. If something it says doesn't match what you see, that's usually a gap in the docs worth flagging.

For deeper context:

- **Architectural decisions and rationale:** [docs/decisions/](decisions/) — ADRs, read in order for the project's reasoning history.
- **Graph development:** [graph/README.md](../graph/README.md) for local workflow, [graph/INFRASTRUCTURE.md](../graph/INFRASTRUCTURE.md) for production deployment.
- **Site development:** [astro/CLAUDE.md](../astro/CLAUDE.md) for how Astro talks to Sanity and Fuseki.

## Where things live

The project uses four planning and documentation surfaces, each with a distinct purpose. Keeping them separated is what makes a lightweight approach possible.

| Surface | Purpose | Lifecycle |
| --- | --- | --- |
| [`docs/`](.) | Stable context: vision, principles, glossary, this doc | Rarely changes |
| [`docs/roadmap.md`](roadmap.md) | Strategic direction: Now / Next / Later, Out of scope; plus a Completed log organized by year | Changes occasionally |
| GitHub Issues | Actionable work: tasks, bugs, content, open questions | Changes constantly |
| [`docs/decisions/`](decisions/) | Decisions made, with rationale (ADRs) | Append-only |

Quick test for where something belongs:

- A stable fact about the project → `docs/`
- Where we're headed (or a high-level note about something we just finished) → `roadmap.md`
- A discrete task or open question → GitHub Issue
- A non-obvious architectural choice we just made → new ADR

## How we work

### Finding current work

In the GitHub web UI: the **Issues** tab on the repo shows everything open. Filter by assignee or label as useful.

At the command line:

```bash
gh issue list                # everything open
gh issue list --assignee @me # what's on you
gh issue view 12             # details on a specific issue
```

The roadmap doc gives you the strategic picture ("we're focused on X right now"); issues give you the concrete picture ("these are the open tasks toward X").

### Proposing changes

For most contributions:

- **Open an issue first** if the change isn't obvious — even a one-liner is fine. Issues give us a shared place to discuss before code or content gets written.
- **Small, obvious fixes** (typos, broken links, clear bugs) can skip the issue and go straight to a pull request.
- **Reference the issue** in the PR with `Closes #N` so it auto-closes when merged.

For content changes — writing or editing methods, adding external resources, restructuring the IO taxonomy — those happen in Sanity Studio, not in the repo. Coordinate before substantial content edits so we don't conflict.

### Working with Claude

Claude reads CLAUDE.md and the docs it references automatically when you start a session in the repo. That means it shares your project context: vision, principles, architectural decisions, conventions.

A few patterns that work well:

- **Draft against the conventions.** _"Read docs/design-principles.md and the `method` schema in studio/. Draft a method entry for X following both."_
- **Investigate before changing.** _"Before we touch the IRI generation logic, read ADR 0002 and explain how the current scheme works."_
- **Catch wrong defaults early.** Claude will sometimes suggest patterns from other projects. If something conflicts with our conventions, push back — the correction usually points at a gap in the docs we should fix.

### Communication

We meet occasionally and stay in touch through the usual channels (chat, email). GitHub Issues and PR comments are for asynchronous context that should persist; chat is for everything else. If a conversation produces a decision worth keeping, drop it into an issue comment or — for architectural choices — write a short ADR.
