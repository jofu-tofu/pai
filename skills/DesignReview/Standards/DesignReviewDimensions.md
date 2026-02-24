# DesignReview Dimensions

Research-backed dimensions for evaluating skill and workflow design quality.

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
4. Separate:
   - `Must Fix`
   - `Should Fix`
   - `Optional`
5. Include a `Design Metadata Links` section whenever external artifacts are referenced.
6. Every recommendation must identify:
   - Owner
   - Artifact to change
   - Expected outcome
