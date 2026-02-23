---
name: CodeReview
description: Comprehensive multi-agent code review and codebase audit system. USE WHEN code review OR review PR OR review pull request OR review changes OR review commits OR review diff OR check my code OR audit code changes OR review this branch OR what did I change OR look over my code OR inspect my changes OR critique this PR OR give feedback on my changes OR audit this module OR audit this directory OR review this codebase OR audit code quality OR review code health OR audit architecture.
---

# CodeReview

Multi-agent code review and codebase audit system that is comprehensive but fits in a single session. Operates in two modes: **diff mode** (review changes against a commit range) and **audit mode** (evaluate existing code in a directory/module). Both modes achieve depth through parallelism — agents review different dimensions simultaneously while a slim context layer prevents token waste. Diff mode verifies claims against changed commits; audit mode verifies claims against actual file contents.

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

**The most common failure mode:** The main session reads the diff and starts writing findings directly — without launching subagents. This produces a shallow, single-perspective review with no dimension documents read and no heuristic-driven analysis. The whole point of this skill is that *subagents* do the reviewing, each reading their own dimension rules. The main session orchestrates — it does not review code itself. If you find yourself writing review findings without having launched subagents first, stop and go back to DelegateAgents.md.

## Workflow Routing

**When executing a workflow, output this notification IMMEDIATELY upon reading Review.md — before any other actions:**

```
Running the **Review** workflow from the **CodeReview** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Review** | "code review", "review my PR", "review this branch", "review my changes", "review my commits", "review last N commits", "check my code", "audit my changes", "what did I change", "do a code review", "run a review", "audit this module", "audit this directory", "review this codebase", "audit code quality", "review code health", "audit architecture" | `Workflows/Review.md` |

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

**Example 6: Codebase audit**
```
User: "Audit the src/auth/ module"
-> Invokes Review workflow in audit mode
-> Gathers target context (file inventory, module structure, languages)
-> Activates structured dimensions based on target size and complexity
-> Agents review full file set, not a diff
```

**Example 7: Architecture audit**
```
User: "Audit the architecture of lib/core/"
-> Invokes Review workflow in audit mode
-> Architecture dimensions (A1-A5) activate based on target structure
-> Agents use audit-specific prompts with full file list
```

## Architecture Notes

The skill uses a **layered compression strategy**:
- Raw diff → Context Layer (slim, structured, agent-ready)
- Context Layer → Agent prompts (each agent only sees what it needs)
- Agent outputs → Synthesis (deduplicated, prioritized)
- Synthesis → Verification (claim-checked against commit range)
- Verified findings → Report (human-readable, severity-ordered)

Agent count scales with **review target size and complexity**:

**Diff mode** (lines changed):
- Small (1-50 lines): up to 4 agents
- Medium (50-300 lines): up to 8 agents
- Large (300+ lines): up to 12 agents

**Audit mode** (target file count and structural complexity):
- Small (1-10 files, single module): up to 4 agents
- Medium (10-50 files, 2-4 modules): up to 8 agents
- Large (50+ files, 5+ modules): up to 12 agents
