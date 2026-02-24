---
id: D7
name: Visual Expressiveness (Mermaid-First)
category: Presentation
baseline: false
weight: 10
---

# D7 - Visual Expressiveness (Mermaid-First)

## Purpose

Ensure structure and flow are visualized when diagrams communicate better than prose.

## Review Heuristics

1. Execution flow is diagrammed when multiple stages exist.
2. Structure map is diagrammed for multi-file or multi-module designs.
3. Diagram labels are stable and clear.
4. Every diagram has a brief interpretation paragraph.

## Scoring Rubric

- `0` - Visuals are missing where they are clearly needed.
- `1` - Some visuals exist but coverage or clarity is incomplete.
- `2` - Visuals clearly communicate structure and replace dense prose.

## Output Format

```markdown
DIMENSION: D7
DIMENSION_SCORE: raw=<0|1|2> weight=10 weighted=<calculated>

FINDINGS:
- Severity: <CRITICAL|HIGH|MEDIUM|LOW|SUGGESTION>
  Artifact: <path:section-or-line>
  Evidence: <one sentence>
  Recommendation: <concrete action>
```
