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

## Review Heuristics

1. Scope includes concrete inclusions and exclusions.
2. Boundaries between core design content and external metadata are clear.
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
