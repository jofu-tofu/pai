---
id: D8
name: Metadata Boundary and Link Hygiene
category: Governance
baseline: true
weight: 10
---

# D8 - Metadata Boundary and Link Hygiene

## Purpose

Verify that critical design context is preserved in-doc while volatile or operational detail is linked as metadata.

## Review Heuristics

1. Critical decisions are understandable without opening external links.
2. External artifacts are linked with explicit purpose labels.
3. Linked critical artifacts include in-doc summaries.
4. Volatile detail is referenced, not embedded, unless required for decisions.

## Scoring Rubric

- `0` - Boundary is broken: critical context is hidden in links or docs are bloated with volatile detail.
- `1` - Boundary exists but has gaps in summaries, link labeling, or stability.
- `2` - Boundary is clear: core design is self-sufficient and metadata links are clean.

## Output Format

```markdown
DIMENSION: D8
DIMENSION_SCORE: raw=<0|1|2> weight=10 weighted=<calculated>

FINDINGS:
- Severity: <CRITICAL|HIGH|MEDIUM|LOW|SUGGESTION>
  Artifact: <path:section-or-line>
  Evidence: <one sentence>
  Recommendation: <concrete action>
```
