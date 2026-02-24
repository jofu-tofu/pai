---
id: D6
name: Verification and Credibility
category: Core
baseline: true
weight: 10
---

# D6 - Verification and Credibility

## Purpose

Check whether claims are verifiable and supported by explicit evidence and checks.

## Review Heuristics

1. Findings include artifact locations and evidence statements.
2. Validation/verification steps exist for critical claims.
3. Unverified claims are explicitly labeled.
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
