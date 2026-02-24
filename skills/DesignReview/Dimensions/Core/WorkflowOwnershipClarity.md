---
id: D5
name: Workflow and Ownership Clarity
category: Core
baseline: false
weight: 12
---

# D5 - Workflow and Ownership Clarity

## Purpose

Ensure the workflow model is explicit: who does what, in what order, and with which artifacts.

## Review Heuristics

1. User-facing and internal workflows are clearly separated.
2. Stage responsibilities are explicit and non-overlapping.
3. Inputs/outputs between stages are documented.
4. Ownership for recommendations is explicit in the report.

## Scoring Rubric

- `0` - Workflow ownership or stage boundaries are unclear.
- `1` - Workflow model exists but has unclear handoffs or responsibilities.
- `2` - Workflow stages, owners, and handoffs are explicit and consistent.

## Output Format

```markdown
DIMENSION: D5
DIMENSION_SCORE: raw=<0|1|2> weight=12 weighted=<calculated>

FINDINGS:
- Severity: <CRITICAL|HIGH|MEDIUM|LOW|SUGGESTION>
  Artifact: <path:section-or-line>
  Evidence: <one sentence>
  Recommendation: <concrete action>
```
