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
- **C17 (Declared depth target)** — Respect intended depth (high-level/component-level/implementation-level).
- **Self-Claims** — Any stated audience or accessibility commitments the design makes about itself.

## Review Heuristics

1. Language and depth match stakeholders (C1) and declared depth target (C17).
2. Do not recommend deeper technical detail than the declared depth target.
3. Don't flag technical terminology when the audience is technical; only flag unclear or unexplained terms for that audience.
4. Structure is easy to scan with meaningful headers and concise blocks.
5. If the design claims a specific audience, content consistently addresses that audience without drifting.

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
