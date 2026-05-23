# Design Principles

These principles guide design and implementation decisions across the UX Methods project — content modeling, ontology and taxonomy work, tooling choices, and code. They apply at every layer; when in doubt, prefer the principle over the local convenience.

1. **Don't build in complexity before it's needed.** Complex systems that work emerge from simple systems that work (Gall's Law).

2. **Model for a purpose, not of a topic.** Don't try to model any subject in the perfect ideal. Models should be goal-driven, intended to accomplish an outcome.

3. **Use standards.** Don't build a new system or choose a proprietary tool when an open, widely adopted standard (like SKOS, Dublin Core, or plain HTML elements) will work.

4. **Choose the least powerful tool suitable for a given purpose** (the Rule of Least Power). Powerful tools build in overhead and complexity. If they do more than needed, evaluate the cost of that overhead and choose a less powerful but sufficient option if available.

5. **Work with the grain of the tools.** Don't try to make HTML, RDF, RSS, etc. do work they're not designed to do. Where implementation options exist, choose the option that aligns most closely with the way the tool or technology is intended to work. This also means that LLMs are used for generating text, like queries or synthesizing responses; while symbolic AI (or NLP) is used to locate information and infer facts.

6. **Decouple content structure from content semantics.** Use structure to describe what a thing is; use semantics to connect that thing to other things. Avoid building connections into the structure itself: these are often shortcuts that lead to unnecessary rigidity and brittleness.
