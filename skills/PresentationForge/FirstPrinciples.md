# First Principles - PresentationForge

> For agents: optimize function (clear persuasion under constraints), then choose format.

## Deconstruction

### Constituent Parts
- Objective and required decision.
- Audience context and stakes.
- Narrative structure.
- Evidence and source credibility.
- Delivery constraints (time, venue, compatibility).
- Render target (HTML or PPT).

### Fundamental Truths (Irreducible)
1. Audience attention is finite.
2. A presentation is a decision tool, not a data dump.
3. Format compatibility can be a hard delivery constraint.
4. HTML-to-PPT or PPT-to-HTML conversion is not perfectly lossless.
5. Unverified claims reduce trust in the entire deck.

## Constraint Classification

| Constraint | Type | Evidence | Challenge |
|---|---|---|---|
| Must support HTML and PPT | Hard | User-defined scope | Keep both as first-class outputs |
| Deck must fit allotted speaking time | Hard | External schedule | Enforce time-aware slide budget |
| Corporate template is mandatory | Soft | Org policy | Allow non-template drafts first |
| Every slide needs animation | Assumption | Preference, not requirement | Default to clarity-first visuals |
| One format fits all audiences | Assumption | Contexts vary | Route by audience and venue |
| Tool choice is fixed | Soft | Multiple viable tools exist | Select tool by output requirements |

## Reconstruction

### Function to Optimize
Produce persuasive, accurate, audience-appropriate decks with predictable delivery quality.

### Rebuilt Architecture
1. Build a format-neutral `Presentation Brief` first.
2. Render the brief through HTML or PPT workflow.
3. Apply one shared quality checklist.
4. Repurpose through content structure before style transfer.

### Key Insight
Message structure is the durable asset; HTML and PPT are renderers.
