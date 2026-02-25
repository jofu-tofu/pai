---
id: D7
name: Visual Expressiveness (Mermaid-First)
category: Presentation
baseline: false
weight: 10
---

# D7 - Visual Expressiveness (Mermaid-First)

## Purpose

Assess whether existing structural content would be better communicated visually.

## Context Dependencies

From `context.md`, read:
- **C11 (Internal stages)** — If multiple stages exist, a flow diagram likely communicates better than prose.
- **Self-Claims** — If the design claims a visual-first or mermaid-first policy, verify it follows through.
- **Structural Inventory** — Check existing diagram coverage.

## Review Heuristics

1. If the design claims a visual-first policy, verify diagrams exist for structural sections. A self-claim violation is a stronger finding.
2. Sections with 3+ paragraphs describing structure or flow could benefit from a diagram — frame as observation, not requirement.
3. Existing diagram labels are stable and clear.
4. Existing diagrams have brief interpretation paragraphs.
5. For small/simple artifacts (single flow with <=3 stages), missing diagrams should usually be low-severity unless visuals are self-claimed.

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
