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
- **C17 (Declared depth target)** — Evidence expectations must match intended depth.
- **Self-Claims** — Identify specific claims the design makes that can be verified against actual artifacts.

## Claim Strength and Required Evidence

Match evidence expectation to claim strength and depth target:

| Claim Type | Typical Wording | Minimum Evidence Expectation |
|---|---|---|
| Planning intent | "We plan to...", "V1 will..." | Decision rationale, scope, acceptance criteria, and verification plan |
| Design-level behavioral rule | "System should...", "Rule is..." | Explicit rule definition and consistency across referenced artifacts |
| Implemented-state assertion | "As implemented...", "Currently does..." | Verifiable implementation anchor (code/test/runbook artifact) |

For high-level or component-level artifacts (C17), do not require routine/tag-level code anchors unless the document explicitly makes implemented-state assertions.

## Review Heuristics

1. Claims in the design (especially self-claims) are backed by evidence at the right level for claim strength and C17.
2. Validation/verification steps exist for critical process claims.
3. Unverified claims are explicitly labeled rather than stated as fact.
4. External references are checked when they support findings.
5. Do not recommend implementation-level anchors for planning-only claims.
6. Only issue high-severity findings when evidence gaps create concrete decision or delivery risk.

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
