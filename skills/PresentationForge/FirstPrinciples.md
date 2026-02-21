# First Principles - PresentationForge

> For agents: optimize function (clear communication under constraints), then choose format.

## Deconstruction

### Constituent Parts
- Objective and required decision.
- Audience context and stakes.
- Content type (general, codebase-analysis, technical-writeup).
- Narrative structure.
- Evidence and source credibility.
- Delivery constraints (time, venue, compatibility).
- Render target (HTML Document or PPT).

### Fundamental Truths (Irreducible)
1. Audience attention is finite.
2. A presentation is a decision tool, not a data dump.
3. HTML documents are for reading; slides are for presenting.
4. Content type determines applicable quality rules.
5. Format compatibility can be a hard delivery constraint.
6. HTML-to-PPT or PPT-to-HTML conversion is not perfectly lossless.
7. Unverified claims reduce trust in the entire output.

## Constraint Classification

| Constraint | Type | Evidence | Challenge |
|---|---|---|---|
| Must support HTML Document and PPT | Hard | User-defined scope | Keep both as first-class outputs |
| Readability standards apply to all outputs | Hard | Research-backed rules | Auto-chain ReadabilityGate |
| Deck must fit allotted speaking time | Hard | External schedule | Enforce time-aware slide budget |
| Corporate template is mandatory | Soft | Org policy | Allow non-template drafts first |
| Every slide needs animation | Assumption | Preference, not requirement | Default to clarity-first visuals |
| One format fits all audiences | Assumption | Contexts vary | Route by audience and venue |
| Tool choice is fixed | Soft | Multiple viable tools exist | Select tool by output requirements |

## Reconstruction

### Function to Optimize
Produce clear, accurate, audience-appropriate documents and presentations with research-backed readability and predictable delivery quality.

### Key Insight
Message structure is the durable asset; HTML Documents and PPT are renderers. Content type determines which quality rules apply. The CreatePresentation workflow implements the full pipeline from brief through format-specific rendering with automatic readability verification.
