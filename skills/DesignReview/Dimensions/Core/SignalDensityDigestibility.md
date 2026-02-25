---
id: D3
name: Signal Density and Digestibility
category: Core
baseline: false
weight: 14
---

# D3 - Signal Density and Digestibility

## Purpose

Assess whether the existing design content communicates the most important information with minimal noise.

## Context Dependencies

From `context.md`, read:
- **C1 (Stakeholders)** — What level of detail do they need? A maintainer needs more depth than a user.
- **C17 (Declared depth target)** — High-level docs should be concise by design.
- **Self-Claims** — If the design claims to be concise or visual-first, check whether it follows through.

## Review Heuristics

1. High-value decisions are easy to find first. Assess what IS present, not what's absent.
2. Long prose is compressed into lists, tables, or visuals when appropriate.
3. Redundant or repetitive content is minimized.
4. Detail level is appropriate for the identified stakeholders — don't flag depth that serves a technical audience.
5. For high-level or compact targets, do not penalize omitted implementation details unless they block understanding of stated decisions.

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
