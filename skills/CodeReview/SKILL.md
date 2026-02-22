---
name: CodeReview
description: Comprehensive multi-agent code review system. USE WHEN code review OR review PR OR review pull request OR review changes OR review commits OR review diff OR check my code OR audit code changes OR review this branch OR what did I change OR look over my code OR inspect my changes OR critique this PR OR give feedback on my changes.
---

# CodeReview

Multi-agent code review system that is comprehensive but fits in a single session. Achieves depth through parallelism — agents review different dimensions simultaneously while a slim context layer prevents token waste. Claims are verified against actual changed commits before surfacing to the user.

## Success Criteria

These criteria orient every workflow decision:

1. **Comprehensive** — No significant issue category goes unchecked (security, performance, architecture, correctness, style)
2. **Single-session** — Entire review fits in one context window, achieved via agents + context compression
3. **Credible** — Every flagged issue traces to an actual changed line in the specified commit range; no false positives from pre-existing code
4. **Believable output** — Report is clear and concise enough that the user reads every word, not skims. No wall-of-text syndrome.
5. **Proportional** — Agent count and skill selection scale with the size and nature of the changes
6. **Verified claims** — Issues discovered are cross-checked against the correct diff before reporting

## Pipeline Discipline (MANDATORY)

**This skill operates as a 5-stage pipeline. Do NOT ad-hoc a review.**

When triggered, you MUST:
1. Read `Workflows/Review.md` FIRST — before reading any source code or diffs
2. Follow Review.md's steps sequentially — each step references an internal workflow file
3. Read each internal workflow file (`GatherContext.md`, `DelegateAgents.md`, etc.) when Review.md tells you to
4. Execute every stage — do not combine, skip, or improvise stages

**Why this matters:** A single-agent review that reads all files into context produces shallow, unverified findings. The pipeline exists to compress context, parallelize depth, and verify claims. Skipping it defeats the skill's purpose.

## Workflow Routing

**When executing a workflow, output this notification IMMEDIATELY upon reading Review.md — before any other actions:**

```
Running the **Review** workflow from the **CodeReview** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Review** | "code review", "review my PR", "review this branch", "review my changes", "review my commits", "review last N commits", "check my code", "audit my changes", "what did I change", "do a code review", "run a review" | `Workflows/Review.md` |

> **Pipeline stages** (GatherContext, DelegateAgents, SynthesizeFindings, VerifyClaims, GenerateReport) are internal — invoked by Review.md, not user-facing. Each has its own workflow file with concrete instructions.

## Examples

**Example 1: Branch review**
```
User: "Do a code review of my last 3 commits"
-> Invokes Review workflow
-> Internally: gathers context → delegates agents → synthesizes → verifies → reports
```

**Example 2: PR review**
```
User: "Review my PR"
-> Invokes Review workflow
-> Asks for branch name or PR number if not provided
```

**Example 3: Scoped review**
```
User: "Review just the auth changes"
-> Invokes Review workflow
-> Scopes diff to auth-related files only
```

**Example 4: Review with additional lenses**
```
User: "/CodeReview /CodingStandards"
-> Invokes Review workflow
-> CodingStandards is a context signal alongside the change fingerprint
-> DelegateAgents constructs dimensions from ALL context: fingerprint languages + CodingStandards categories
-> TypeScript dimension gets both general correctness AND CodingStandards TypeScript rules
```

**Example 5: Review with multiple lenses**
```
User: "/CodeReview /CodingStandards /TestDriven"
-> Both skills feed into dimension construction alongside the change fingerprint
-> Dimensions emerge from the combined context, not from separate paths
```

## Architecture Notes

The skill uses a **layered compression strategy**:
- Raw diff → Context Layer (slim, structured, agent-ready)
- Context Layer → Agent prompts (each agent only sees what it needs)
- Agent outputs → Synthesis (deduplicated, prioritized)
- Synthesis → Verification (claim-checked against commit range)
- Verified findings → Report (human-readable, severity-ordered)

Agent count scales with change size (dynamic caps):
- Small (1-50 lines changed): up to 4 agents
- Medium (50-300 lines): up to 8 agents
- Large (300+ lines): up to 12 agents
