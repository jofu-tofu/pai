# DesignReview Dimensions

Research-backed dimensions for evaluating skill and workflow design quality.

## Review Philosophy

Dimension agents review designs using the enriched context layer produced by GatherContext. This context includes a **design checklist assessment** (C1–C17) that tells each dimension what the design contains, what it claims about itself, who its stakeholders are, and the intended depth of the artifact.

**Core principles:**

1. **Critique against context, not a universal template.** Whether something "should" be present depends on the design's stakeholders, type, and self-claims — not a one-size-fits-all checklist. The context layer provides this grounding.
2. **Don't request additions — identify gaps.** Findings should describe mismatches between what the design claims or what its stakeholders need vs. what's actually present. Never say "add X" generically; say "given stakeholders are Y, X is expected but missing/incomplete."
3. **Self-claims are the baseline.** If the design declares a policy (e.g., "mermaid-first", "thin orchestrator"), check whether the content follows through. A violation of a self-claim is a stronger finding than a missing best practice.
4. **Craft observations are about what IS present.** For intrinsic quality (readability, signal density, visual clarity), assess the existing content. Don't say "this section should exist" — say "this existing section has low signal density because..."

## Scoring Scale

- `0` = Missing or unclear
- `1` = Partially present, needs improvement
- `2` = Clear, complete, high quality

Weighted score per dimension:

`dimension_score = (raw_score / 2) * weight`

## Dimensions

| ID | Dimension | Weight | What Good Looks Like | Primary Sources |
|---|---|---:|---|---|
| D1 | Audience, Readability, and Accessibility | 16 | Scope and language match the audience, and content is readable and inclusive | Google Technical Writing: [Write for your audience](https://developers.google.com/tech-writing/one/audience), W3C WAI: [Accessibility principles](https://www.w3.org/WAI/fundamentals/accessibility-principles/) |
| D2 | Scope and Boundaries | 14 | Goals, non-goals, and exclusions are explicit and testable | Google Technical Writing: [Organize large docs](https://developers.google.com/tech-writing/two/large-docs) |
| D3 | Signal Density and Digestibility | 14 | High information-per-line, low fluff, easy to skim | Google Technical Writing: [Organize large docs](https://developers.google.com/tech-writing/two/large-docs), Microsoft ADR: [ADR guidance](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record) |
| D4 | Decision Traceability and Tradeoffs | 14 | Decisions, alternatives, and consequences are explicit | Microsoft ADR: [ADR guidance](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record) |
| D5 | Workflow and Ownership Clarity | 12 | Review steps, stakeholders, and open questions are explicit | Atlassian: [Design review template](https://www.atlassian.com/software/confluence/templates/design-review) |
| D6 | Verification and Credibility | 10 | Claims are tied to verifiable artifacts and checks | Microsoft ADR: [ADR guidance](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record) |
| D7 | Visual Expressiveness (Mermaid-First) | 10 | Structure and flow are shown visually when clearer than prose | C4 Model: [Introduction](https://c4model.com/introduction), C4 Model: [Review checklist](https://c4model.info/), GitHub: [Create diagrams](https://docs.github.com/en/enterprise-cloud@latest/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams?apiVersion=2022-11-28) |
| D8 | Metadata Boundary and Link Hygiene | 10 | Important but volatile context is linked as metadata, while decision-critical context remains summarized in the design | Google Technical Writing: [Organize large docs](https://developers.google.com/tech-writing/two/large-docs), Microsoft ADR: [ADR guidance](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record), Atlassian: [Design review template](https://www.atlassian.com/software/confluence/templates/design-review) |

Total weight: `100`

## Mermaid-First Policy

When evaluating or reporting structure:

1. If relationships can be represented as nodes and edges, provide a Mermaid diagram.
2. If a diagram can replace two or more prose paragraphs, use the diagram.
3. Every diagram must include:
   - A concise title
   - Stable node labels
   - A one-paragraph interpretation

Minimum diagrams for structure reviews:

1. **Execution flow diagram** (workflow or pipeline)
2. **System structure diagram** (directories/modules/files)

## Metadata Boundary Policy

Keep in the core design:

1. Scope, constraints, and decision rationale
2. Tradeoffs and alternatives
3. Interfaces, risks, and acceptance criteria
4. A short summary of every external artifact that is required to understand decisions

Keep outside the core design (linked as metadata):

1. Ticket discussions and meeting transcripts
2. Raw research dumps, logs, and dashboards
3. Historical execution traces and chat history
4. Rapidly changing operational details

Review checks for D8:

1. Every critical external dependency has a stable link.
2. No critical decision depends on a link with zero in-doc summary.
3. Links resolve and are clearly labeled by purpose.
4. The design can still be understood if external links are temporarily unavailable.

## Output Quality Guardrails

1. Put the highest-impact finding first.
2. Use short sections with clear headers.
3. Keep recommendations concrete and scoped.
4. Respect declared depth target (C17): do not recommend implementation-level detail for high-level/component-level artifacts unless they make implemented-state claims.
5. Prefer smallest-change recommendations; avoid broad rewrites unless multiple findings share one root cause.
6. Severity must match risk:
   - High/Critical only when decision quality, delivery confidence, or safety is materially impacted.
   - Medium/Low/Suggestion for readability or preference improvements.
7. For auth-gated external links, treat in-doc summaries as acceptable fallback evidence.
8. Never recommend a section "because templates usually have it"; tie every recommendation to context, self-claims, and stakeholder needs.
9. Separate:
   - `Must Fix`
   - `Should Fix`
   - `Optional`
10. Include a `Design Metadata Links` section whenever external artifacts are referenced.
11. Every recommendation must identify:
   - Owner
   - Artifact to change
   - Expected outcome
