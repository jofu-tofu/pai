---
id: D4
name: Decision Traceability and Tradeoffs
category: Core
baseline: true
weight: 14
---

# D4 - Decision Traceability and Tradeoffs

## Purpose

Check whether decisions are explicit, traceable to evidence, and compared against alternatives.

## Review Heuristics

1. Key decisions are clearly labeled.
2. Alternatives and tradeoffs are documented.
3. Consequences of decisions are described.
4. Findings and recommendations trace back to concrete artifacts.

## Scoring Rubric

- `0` - Decisions are implicit and tradeoffs are missing.
- `1` - Some decision rationale exists but is incomplete or not traceable.
- `2` - Decision path is clear, evidence-backed, and tradeoffs are explicit.

## Output Format

```markdown
DIMENSION: D4
DIMENSION_SCORE: raw=<0|1|2> weight=14 weighted=<calculated>

FINDINGS:
- Severity: <CRITICAL|HIGH|MEDIUM|LOW|SUGGESTION>
  Artifact: <path:section-or-line>
  Evidence: <one sentence>
  Recommendation: <concrete action>
```
