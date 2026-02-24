---
id: D2
name: Scope and Boundaries
category: Core
baseline: true
weight: 14
---

# D2 - Scope and Boundaries

## Purpose

Verify that what is in scope, out of scope, and conditionally scoped is explicit and actionable.

## Context Dependencies

From `context.md`, read:
- **C4 (Explicit scope)**, **C5 (Non-goals)**, **C6 (Boundary with adjacent systems)** — Check whether these are present and adequate.
- **Self-Claims** — If the design states its scope, verify the content actually stays within it.
- **Checklist Summary** — If scope items are marked Missing, assess whether they're genuinely needed given stakeholders (C1) and design type (C2).

## Review Heuristics

1. If scope is stated, verify the content stays within it. Flag content that exceeds or contradicts stated scope.
2. If scope is expected given the stakeholders and design type but absent, note it as a gap — grounding the expectation in context, not a universal rule.
3. Non-goals are explicit, not implied.
4. Scope statements are testable and not vague.

## Scoring Rubric

- `0` - Scope is missing or ambiguous.
- `1` - Scope exists but leaves meaningful edge cases unclear.
- `2` - Scope and boundaries are explicit, testable, and stable.

## Output Format

```markdown
DIMENSION: D2
DIMENSION_SCORE: raw=<0|1|2> weight=14 weighted=<calculated>

FINDINGS:
- Severity: <CRITICAL|HIGH|MEDIUM|LOW|SUGGESTION>
  Artifact: <path:section-or-line>
  Evidence: <one sentence>
  Recommendation: <concrete action>
```
