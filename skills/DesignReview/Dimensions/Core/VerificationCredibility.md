---
id: D6
name: Verification and Credibility
category: Core
baseline: true
weight: 10
---

# D6 - Verification and Credibility

## Purpose

Check whether claims made in the design are verifiable and supported by explicit evidence and checks.

## Context Dependencies

From `context.md`, read:
- **C13 (Success criteria)**, **C14 (Evidence for claims)** — Check whether these are present and adequate.
- **Self-Claims** — Identify specific claims the design makes that can be verified against actual artifacts.

## Review Heuristics

1. Claims in the design (especially self-claims from SkillIntent) are backed by verifiable artifacts.
2. Validation/verification steps exist for critical process claims.
3. Unverified claims are explicitly labeled rather than stated as fact.
4. External references are checked when they support findings.

## Scoring Rubric

- `0` - Claims are mostly unsupported or unverifiable.
- `1` - Some verification exists, but coverage is incomplete.
- `2` - Verification is systematic and transparent.

## Output Format

```markdown
DIMENSION: D6
DIMENSION_SCORE: raw=<0|1|2> weight=10 weighted=<calculated>

FINDINGS:
- Severity: <CRITICAL|HIGH|MEDIUM|LOW|SUGGESTION>
  Artifact: <path:section-or-line>
  Evidence: <one sentence>
  Recommendation: <concrete action>
```
