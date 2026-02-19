---
name: CodeReview
description: Comprehensive multi-agent code review system. USE WHEN code review OR review PR OR review pull request OR review changes OR review commits OR review diff OR check my code OR audit code changes OR review this branch OR what did I change.
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

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **Review** workflow from the **CodeReview** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Review** | "code review", "review my PR", "review this branch", "review my changes", "review my commits", "review last N commits", "check my code", "audit my changes", "what did I change", "do a code review", "run a review" | `Workflows/Review.md` |

> **Pipeline stages** (GatherContext, DelegateAgents, SynthesizeFindings, VerifyClaims, GenerateReport) are internal — invoked by Review.md, not user-facing.

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

## Architecture Notes

The skill uses a **layered compression strategy**:
- Raw diff → Context Layer (slim, structured, agent-ready)
- Context Layer → Agent prompts (each agent only sees what it needs)
- Agent outputs → Synthesis (deduplicated, prioritized)
- Synthesis → Verification (claim-checked against commit range)
- Verified findings → Report (human-readable, severity-ordered)

Agent count scales with change size:
- Small (1-50 lines changed): 2 agents
- Medium (50-300 lines): 3-4 agents
- Large (300+ lines): 5-8 agents
