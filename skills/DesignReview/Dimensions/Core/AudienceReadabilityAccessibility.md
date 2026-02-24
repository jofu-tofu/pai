---
id: D1
name: Audience, Readability, and Accessibility
category: Core
baseline: false
weight: 16
---

# D1 - Audience, Readability, and Accessibility

## Purpose

Evaluate whether the design language matches its audience and stays readable and inclusive.

## Context Dependencies

From `context.md`, read:
- **C1 (Stakeholders)** — Who consumes this design? Calibrate readability expectations to them.
- **C2 (Design type)** — Technical depth expectations vary by type.
- **Self-Claims** — Any stated audience or accessibility commitments the design makes about itself.

## Review Heuristics

1. Language and depth match the stakeholders identified in context (C1). Don't flag technical language if the audience is technical.
2. Wording is clear, concrete, and avoids unnecessary jargon for the identified audience.
3. Structure is easy to scan with meaningful headers and concise blocks.
4. If the design claims a specific audience, content consistently addresses that audience without drifting.

## Scoring Rubric

- `0` - Audience is unclear or prose is hard to parse.
- `1` - Audience is mostly clear, but readability/inclusive clarity has gaps.
- `2` - Audience fit and readability are clear, consistent, and low-friction.

## Output Format

```markdown
DIMENSION: D1
DIMENSION_SCORE: raw=<0|1|2> weight=16 weighted=<calculated>

FINDINGS:
- Severity: <CRITICAL|HIGH|MEDIUM|LOW|SUGGESTION>
  Artifact: <path:section-or-line>
  Evidence: <one sentence>
  Recommendation: <concrete action>
```
