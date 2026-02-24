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

## Context Dependencies

From `context.md`, read:
- **C7 (Key decisions)**, **C8 (Alternatives considered)**, **C9 (Constraints)** — Check whether these are present and adequate.
- **Self-Claims** — If the design lists decisions in SkillIntent or a decisions table, verify the content reflects and follows through on them.
- **Checklist Summary** — If decision items are marked Missing, assess whether they're genuinely needed given design type (C2).

## Review Heuristics

1. If the design claims specific decisions (via SkillIntent, decisions table), verify the content follows through on them.
2. Alternatives and tradeoffs are documented for significant decisions.
3. Consequences of decisions are described.
4. If decision documentation is expected given the design type but absent, note it — grounding the expectation in context.

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
