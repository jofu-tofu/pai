---
id: D3
name: Signal Density and Digestibility
category: Core
baseline: false
weight: 14
---

# D3 - Signal Density and Digestibility

## Purpose

Assess whether the design communicates the most important information with minimal noise.

## Review Heuristics

1. High-value decisions are easy to find first.
2. Long prose is compressed into lists, tables, or visuals when appropriate.
3. Redundant or repetitive content is minimized.
4. Recommendations are concrete and prioritized.

## Scoring Rubric

- `0` - Report is noisy, repetitive, or hard to skim.
- `1` - Core information is present but buried or unevenly structured.
- `2` - Information is concise, prioritized, and easy to consume quickly.

## Output Format

```markdown
DIMENSION: D3
DIMENSION_SCORE: raw=<0|1|2> weight=14 weighted=<calculated>

FINDINGS:
- Severity: <CRITICAL|HIGH|MEDIUM|LOW|SUGGESTION>
  Artifact: <path:section-or-line>
  Evidence: <one sentence>
  Recommendation: <concrete action>
```
