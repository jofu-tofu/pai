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

## Context Dependencies

From `context.md`, read:
- **C10 (Entry points)**, **C11 (Internal stages)**, **C12 (Artifact contracts)** — Check whether these are present and adequate.
- **Self-Claims** — If the design claims a specific architecture (e.g., "thin orchestrator", "parallel agents"), verify the workflow structure matches.

## Review Heuristics

1. If the design claims a workflow architecture, verify the content matches (e.g., stated "thin orchestrator" but orchestrator inlines stage logic).
2. User-facing and internal workflows are clearly separated.
3. Stage responsibilities are explicit and non-overlapping.
4. Inputs/outputs between stages are documented where the design type warrants it (per C2).

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
